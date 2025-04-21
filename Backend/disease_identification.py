import os
import json
from PIL import Image
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from google import genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import SystemMessage, HumanMessage
from google.genai import types

class AgronomicAdvice(BaseModel):
    disease_name: str = Field(description="Name of the identified disease")
    description: str = Field(description="Brief description of the disease")
    disease_management: List[str] = Field(description="Specific treatments and control measures")
    preventive_measures: List[str] = Field(description="Steps to prevent disease recurrence")
    local_context: List[str] = Field(description="Recommendations adapted to Punjab's context")

def identify_and_advise_on_plant_disease(
    plant: str,
    affected_part: str,
    farmer_observation: str,
    image_path: str,
    language: str,
    soil_type: str = "Loamy",
    growth_stage: str = "Mature"
) -> Dict[str, Any]:
    """
    A comprehensive function that:
    1. Identifies ONLY the disease name from an image using Google Gemini Pro
    2. Uses the disease name to get detailed agronomic advice in structured JSON format

    Args:
        plant: Type of plant/crop affected
        affected_part: The part of plant showing symptoms (leaves, stem, fruit, etc.)
        farmer_observation: Description of symptoms observed by farmer
        image_path: Path to the image file showing the disease symptoms
        language: Language to provide the response in
        soil_type: Type of soil where the plant is growing (default: Loamy)
        growth_stage: Current growth stage of the plant (default: Mature)

    Returns:
        Dictionary containing disease information and categorized recommendations
    """
    # Step 1: Identify ONLY the disease name using Google Gemini Pro with vision capabilities
    disease_name = identify_disease_name_from_image(plant, affected_part, farmer_observation, image_path, language)

    # Step 2: Get detailed agronomic advice in structured JSON format
    detailed_advice = get_complete_disease_advice(
        crop_type=plant,
        growth_stage=growth_stage,
        soil_type=soil_type,
        disease_name=disease_name,
        farmer_observation=farmer_observation,
        language=language
    )

    return detailed_advice

def identify_disease_name_from_image(plant: str, affected_part: str, farmer_observation: str, image_path: str, language: str) -> str:
    """
    Identifies ONLY the plant disease name from an image using Google Gemini Pro with vision capabilities.

    Returns:
        String containing just the disease name
    """
    # Initialize the Google Gemini client
    client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY", "AIzaSyDQTn-m-PaRuX4GVxsyNgopU2nmHQJMrSs"))

    # Load the image
    try:
        image = Image.open(image_path)
    except Exception as e:
        return "Error loading image"

    # Define the system message - emphasize returning ONLY the disease name
    system_message = (
        "You are an expert plant pathologist specializing in diseases common in Punjab, Pakistan. "
        "Analyze the plant image and identify the most likely disease based on visual symptoms. "
        f"Your response should be in {language} and ONLY include the disease name - nothing else. "
        "Do not provide explanations, descriptions, or any other information. "
        "Return ONLY the disease name as a simple text string."
    )

    # Construct the user prompt
    user_prompt = (
        f"Identify the disease affecting this {plant} plant where the affected part is the {affected_part}. "
        f"The farmer observes: '{farmer_observation}'. "
        "The plant is grown in Punjab, Pakistan. "
        f"Return ONLY the disease name in {language} - nothing else."
    )

    # Make the generation request
    try:
        response = client.models.generate_content(
            model='gemini-1.5-pro',  # Model with vision support
            contents=[
                {"role": "user", "parts": [user_prompt, {"inline_data": {"mime_type": "image/jpeg", "data": image}}]}
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_message,
            )
        )

        # Extract just the disease name from the response
        disease_name = response.text.strip()

        # If response is too long or contains JSON/explanations, extract just the likely disease name
        if len(disease_name) > 100 or '{' in disease_name:
            try:
                # Try to parse as JSON if it looks like JSON
                if '{' in disease_name and '}' in disease_name:
                    parsed = json.loads(disease_name)
                    if 'disease_name' in parsed:
                        return parsed['disease_name']

                # Otherwise just take the first line or sentence
                disease_name = disease_name.split('\n')[0].split('.')[0].strip()
                return disease_name[:50]  # Truncate if still too long
            except:
                # Fallback to first 50 chars if parsing fails
                return disease_name[:50]

        return disease_name

    except Exception as e:
        return f"Error in disease identification: {str(e)[:50]}"

def get_complete_disease_advice(
    crop_type: str,
    growth_stage: str,
    soil_type: str,
    disease_name: str,
    farmer_observation: str,
    language: str
) -> Dict[str, Any]:
    """
    Generates complete disease information and agronomic recommendations as a structured JSON object
    using LangChain and Google Gemini.

    Returns:
        Complete dictionary with disease name, description, and categorized recommendations
    """
    # Initialize the Google Gemini Model with LangChain
    model = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.5,
        google_api_key=os.environ.get("GOOGLE_API_KEY", "AIzaSyDQTn-m-PaRuX4GVxsyNgopU2nmHQJMrSs")
    )

    # Bind the model to structured output
    structured_model = model.with_structured_output(AgronomicAdvice)

    # System message for context
    system_message = f"""
    You are a seasoned agronomist with extensive experience in Punjab, Pakistan's agricultural landscape. Your role is to provide comprehensive information about plant diseases and offer detailed, practical advice to farmers in {language}. The disease name has already been identified from an image using another model.

    Your response must be in {language} and follow this structured format precisely:

    1. A precise disease name (confirmed or corrected based on your expert knowledge)
    
    2. A clear, concise description of the disease that includes:
       - Primary causal agent (fungus, bacteria, virus, etc.)
       - Key symptoms that farmers can visually identify
       - Environmental conditions that promote the disease
       - Potential impact on crop yield if left untreated
       - Keep this section under 100 words and use simple language

    3. Three distinct categories of recommendations, each with 2-4 specific, actionable bullet points:
    
       a) Disease Management: 
          - List specific treatments with exact product names available in Punjab
          - Include precise application rates and timing
          - Mention cultural practices for immediate control
          - Each recommendation should be a single sentence, clear and actionable
    
       b) Preventive Measures:
          - Name specific resistant varieties available in Punjab
          - Include precise crop rotation recommendations
          - Suggest specific soil management practices
          - Each measure should be a single, direct sentence
    
       c) Local Context:
          - Mention where to buy recommended products in Punjab
          - Include relevant local agricultural extension contacts
          - Suggest affordable alternatives for small-scale farmers
          - Each point should be practical and immediately applicable

    Your recommendations must be:
    - Specific: Name exact products, varieties, and practices
    - Practical: Farmers should be able to implement them with local resources
    - Clear: Use simple language and avoid technical jargon
    - Concise: Each recommendation should be a single, direct statement
    """

    # Construct the user prompt
    user_prompt = (
        f"Crop Type: {crop_type}\n"
        f"Growth Stage: {growth_stage}\n"
        f"Soil Type: {soil_type}\n"
        f"Identified Disease: {disease_name}\n"
        f"Farmer's Observations: {farmer_observation}\n\n"
        f"Please provide a comprehensive analysis of this disease situation in {language} with a clear description "
        f"and categorized recommendations (Disease Management, Preventive Measures, Local Context) "
        f"for farmers in Punjab, Pakistan. Structure your response according to the exact format described."
    )

    # Create message list
    messages = [
        SystemMessage(content=system_message),
        HumanMessage(content=user_prompt),
    ]

    try:
        # Invoke AI model
        result = structured_model.invoke(messages)

        # Return the complete structured response
        return {
            "disease_name": result.disease_name,
            "description": result.description,
            "disease_management": result.disease_management,
            "preventive_measures": result.preventive_measures,
            "local_context": result.local_context
        }

    except Exception as e:
        # Log the error and return a meaningful error message
        print(f"Error invoking AI model: {e}")
        return {
            "disease_name": disease_name,
            "description": f"Unable to retrieve disease information at this time.",
            "disease_management": [
                f"Error: Unable to generate disease management recommendations."
            ],
            "preventive_measures": [
                f"Error: Unable to generate preventive measures."
            ],
            "local_context": [
                f"Please consult with your local agricultural extension office for assistance with this disease.",
                f"Technical details: {str(e)[:100]}"
            ]
        }