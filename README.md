# CartoonGAN Web App

## Overview

The **CartoonGAN Web App** is a React-based application designed to transform images into cartoon-style artwork using a pre-trained CartoonGAN model. This application operates entirely in the browser, leveraging TensorFlow.js and WebAssembly for real-time performance and efficiency.

---

## Features

- **Upload Image**: Select an image to be cartoonized directly from your device.
- **Cartoonize**: Convert uploaded images into cartoon-style artwork with a single click.
- **In-browser Processing**: All processing is done in the browser, ensuring privacy and faster performance.
- **Responsive Design**: Optimized for use across different devices and screen sizes.

---

## Demo

Insert a screenshot or video demonstrating the application in action here.

---

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16 or later)
- **npm** (v7 or later) or **yarn**
- A modern web browser supporting WebAssembly

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/cartoon-gan-web.git
   cd cartoon-gan-web
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open the app in your browser:
   ```
   http://localhost:5173
   ```

---

## Project Structure

```plaintext
cartoon-gan-web/
├── src/
│   ├── components/
│   │   ├── Cartoonizer.tsx   # Core component handling image cartoonization
│   ├── models/
│   │   ├── web-uint8/        # Pre-trained CartoonGAN model
│   ├── App.tsx              # Main application file
│   ├── index.tsx            # Entry point of the application
├── public/
│   ├── assets/
│   │   ├── image.png         # Placeholder image
├── package.json             # Project metadata and dependencies
```

---

## Usage

### Steps to Cartoonize an Image:

1. **Upload Image**: Click the **Upload Image** button and select an image from your device.
2. **Cartoonize**: Click the **Cartoonize** button to process the image.
3. **View Result**: The cartoonized image will be displayed on the canvas.

---

## Technology Stack

- **React**: User interface framework.
- **TensorFlow.js**: In-browser machine learning library.
- **WebAssembly**: Enhances performance of TensorFlow.js operations.
- **TypeScript**: Provides type safety and improved developer experience.

---

## How It Works

1. **Model Loading**: The CartoonGAN model is loaded from the `models/web-uint8/` directory using TensorFlow.js.
2. **Image Preprocessing**: Uploaded images are normalized and resized to match the input requirements of the model.
3. **Cartoonization**: The CartoonGAN model processes the image and outputs the cartoon-style result.
4. **Postprocessing**: The result is displayed on a canvas element in the browser.

---

## Known Issues

- Large image sizes may cause longer processing times.
- Ensure that the browser supports WebAssembly and TensorFlow.js for optimal performance.

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request with your changes.

---

## Acknowledgments

- **CartoonGAN**: For the pre-trained model enabling high-quality image transformations.
- **TensorFlow.js**: For making machine learning accessible in the browser.
- **React**: For building an interactive and responsive user interface.
