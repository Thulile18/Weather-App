 Weather Application

 Project Description

This Weather Application is an interactive, data-driven single-page application (SPA) engineered using React and TypeScript. The platform delivers precise meteorological insights by offering real-time weather analytics alongside detailed hourly and daily forecast structures. Users can seamlessly manage geographic locations through an integrated bookmarking mechanism and configure localized measurement units. The system incorporates background weather analytics to dynamically identify severe atmospheric conditions and dispatch system-level process alert notifications.

Production Deployment URL: https://vercel.app

Installation and Setup:

Repository Cloning and Execution

Follow these steps to initialize and execute the application in a local development environment:

bash
Clone the remote version control repository
git clone https://github.com

Navigate to the root directory of the project
cd Weather-App

 Install required package dependencies
npm install

 Initialize the local Vite development server
npm run dev

 Production Compilation and Assets Optimization
bash
Compile and optimize source files for production deployment
npm run build

Preview the compiled production build locally
npm run preview

 Tech Stack

 Category Technology 

 Frontend Framework - React 19
 Programming Language - TypeScript (Strict Typing Enabled) 
 User Interface Styling - Custom Vanilla CSS (Plain CSS Stylesheets) 
 Routing Architecture - React Router v6 
 Network Layer Client - Axios HTTP Client 
 Build Toolchain and Bundler - Vite 

 Project Add-ons

* Live Deployment Instance: https://vercel.app
* Source Version Control Repository: https://github.com


 Project Structure

Weather-App/
├── src/
│   ├── components/      - Atomic reusable interface components
│   │   ├── Button.tsx   - Generic action button component
│   │   ├── Input.tsx    - Generic controlled text text input fields
│   │   └── WeatherCard.tsx - Meteorological profile card layout
│   ├── App.tsx          - Main layout coordinator, local storage, and logic states
│   ├── main.tsx         - Operational compilation entry point
│   └── index.css        - Plain CSS structural styles blueprint
├── index.html           - Document Object Model (DOM) container entry
├── package.json         - Project manifest configuration dependencies
└── README.md            - System architectural documentation


Application Features

* Real-Time Data Streams: Monitors and displays critical meteorological vectors including temperature, humidity, and wind speed for any set location.
* Granular Forecast Layers: Offers responsive toggle controllers to alternate between immediate hourly updates and long-range daily parameters.
* Geographic Target Filtering: Employs an explicit search routine capable of targeting and rendering global city names dynamically.
* Bookmark State Persistence: Provides storage handlers to instantly save or eliminate location profiles from a favorites register via LocalStorage management.
* Global Preference Synchronization: Enables users to switch measurement references between Celsius and Fahrenheit metrics seamlessly.
* Proactive Atmospheric Alerts: Runs real-time diagnostic checks on weather states to notify users of extreme conditions via active process notification banners.
* Responsive Fluid Layout: Adapts layout elements dynamically to maintain structural integrity across diverse mobile, tablet, and desktop viewports (320px to 1200px).
* Offline Access Caching: Caches user preferences, application themes, and recently viewed location metrics inside browser memory for 100% data-free loading.


 Author

Thulile18

* Remote Source Platform: https://github.com
* Project Repository: https://github.com/Weather-App
* Live URL: https://vercel.app

