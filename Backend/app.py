from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from recommendations import get_recommendations
from pydantic import BaseModel
from disease_identification import identify_and_advise_on_plant_disease
import shutil
import tempfile
import os

# Initialize FastAPI app
app = FastAPI()

# Enable CORS (Modify allow_origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define input data model
class CropData(BaseModel):
    crop_type: str
    growth_stage: str
    soil_type: str
    issue: str
    
    selected_question: str

class PlantDiseaseRequest(BaseModel):
    cropType: str
    affectedPart: str 
    farmerObservation: str
    language: str
    soilType: str = "Loamy"
    growthStage: str = "Mature"


@app.get("/")
async def root():
    return {"message": "Welcome to the Crop Recommendation API!"}

# API route to get AI-generated recommendations
@app.post("/recommendations/", response_model=List[str])
async def recommendations(data: CropData):
    return get_recommendations(data)

@app.post("/identify-disease")
async def identify_disease(
    image: UploadFile = File(...),
    cropType: str = Form(...),
    affectedPart: str = Form(...),
    farmerObservation: str = Form(...),
    language: str = Form("English"),
    soilType: str = Form("Loamy"),
    growthStage: str = Form("Mature")
):
    """
    Endpoint to identify plant disease and provide recommendations
    """
    # Create temporary file to store the uploaded image
    temp_dir = tempfile.mkdtemp()
    try:
        temp_file_path = os.path.join(temp_dir, image.filename)
        
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # Process the image and get disease identification
        result = identify_and_advise_on_plant_disease(
            plant=cropType,
            affected_part=affectedPart,
            farmer_observation=farmerObservation,
            image_path=temp_file_path,
            language=language,
            soil_type=soilType,
            growth_stage=growthStage
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temporary directory
        shutil.rmtree(temp_dir)

