# @YieldPrediction.tsx

This screen is responsible for displaying yield prediction data for wheat fields. Below is a breakdown of the required functionality and data flow.

---

## 🔗 Firebase Integration

Create a **Firebase collection** named:


### Each document should store:

- `fieldSize`  
- `cropType` (e.g., "wheat")  
- `sowingDate`  
- `latitude`  
- `longitude`  
- `daysRemaining` (calculated from sowing date + 15 days per round)  
- `currentRound` (tracks 15-day cycles)  
- `predictedYield` (latest estimated yield value)

---

## 📊 Prediction History (Nested in Collection)

Maintain a **`predictionHistory`** array inside the same document.

Each entry should include:

- `round` (e.g., 1, 2, etc.)  
- `date` (date of prediction)  
- `predictedYield` (e.g., "1250 kg/hectare")  
- `weatherConditions` (snapshot of weather when predicted)  
- `yieldChange` (either `"Increased"`, `"Decreased"` or `"N/A"` for the first round)

---

## 🖥️ Display Logic

All stored data should be clearly displayed:

- Field Details (top section)
- Current Round & Days Remaining
- **Predicted Yield Card**:
  - Estimated Yield (e.g., `32 mounds/hectare`)
  - % change compared to regional average
  - Trend (e.g., Increasing or Decreasing)
- **15-Day Yield Forecast Graph**:
  - Line chart with:
    - `Predicted Yield` (solid line)
    - `Optimal Yield` (dashed line)
- **Previous Predictions** (see screenshot reference):
  - Show history in graph or list format as per design.

---

## 📆 Days Remaining Calculation

- Start of each round: `daysRemaining = 15`
- Decrease this count daily until it reaches 0.

---

## 🔁 Re-prediction Logic

- When `daysRemaining === 0`, display a **"Predict Again"** button.
- On click:
  - Trigger new yield prediction.
  - Append new entry to `predictionHistory`.
  - Increment `currentRound`.
  - Reset `daysRemaining` to 15.

---

## 🌾 Field Data Source

- Wheat field data is fetched from the **@FieldDetails.tsx** screen.

---

## 🧪 Initial Display for New Users

For **new users** who haven’t generated any yield predictions yet:

- Show **sample data** (mock values and chart) until real data is available from Firebase.

📸 **Design Reference:**

I have attached the screenshot.

---


## Bilingual

Also write the text in both urdu and English and update the @en.json and ur.json.

## Map

Also make sure that the map remains intact we also have to display the map don't change that.


Ensure all data (including predicted yield) is saved within the **Yield Prediction** Firebase collection, and the display remains accurate and user-friendly.

