# Final Year Project - Farmer Expert Buyer App

This app allows users to interact based on their role as a Farmer, Expert, or Buyer. It provides different functionalities based on user type, including yield prediction for farmers, messaging for experts, and an auction system for buyers. Authentication is handled via Supabase, and the app features a role-based navigation system.

## User Selection Screen

### Overview
The **User Selection Screen** is the first screen that appears after launching the app. It allows the user to choose their role: Farmer, Expert, or Buyer. This selection will determine the user flow and interactions for the entire app. Once the user selects a role, they will proceed to the sign-in or sign-up process, where their role is initialized and saved for further navigation.

### Screen Layout
- A title asking the user to "Select User Type."
- Three buttons representing the roles: **Farmer**, **Expert**, and **Buyer**.
- Upon clicking any button, the user is navigated to the Sign-in screen, and the selected role is passed as a parameter.

### File Structure

app
├── (tabs)
│   ├── _layout.tsx
│   ├── explore.tsx
│   └── index.tsx
├── _layout.tsx
├── +html.tsx
└── +not-found.tsx
assets
components
├── _tests_
├── navigation
├── Collapsible.tsx
├── ExternalLink.tsx
├── HelloWave.tsx
├── ParallaxScrollView.tsx
├── ThemedText.tsx
└── ThemedView.tsx
constants
hooks
node_modules
scripts
.gitignore
app.json
babel.config.js
package.json
README.md
tsconfig.json
