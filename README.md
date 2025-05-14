# Site Generator

## Overview
This project is a modular site generator designed to create HTML pages for various file types and directories. It includes configuration settings, logging functionality, validation checks, HTML generation, and viewer modules.

## Project Structure
```
site-generator
├── src
│   ├── config
│   │   └── config.js
│   ├── logging
│   │   └── logger.js
│   ├── validation
│   │   └── validator.js
│   ├── html
│   │   └── generator.js
│   ├── viewer
│   │   └── viewer.js
│   └── index.js
├── package.json
├── .eslintrc.json
├── .gitignore
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd site-generator
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To generate the site, run the following command:
```
node src/index.js
```

## Modules
- **Configuration**: Located in `src/config/config.js`, this module contains all the configuration settings for the site generator.
- **Logging**: The `src/logging/logger.js` module provides logging functionalities for debugging and error handling.
- **Validation**: The `src/validation/validator.js` module ensures that the application configuration is valid and checks for excluded files.
- **HTML Generation**: The `src/html/generator.js` module is responsible for generating HTML pages for file listings.
- **Viewer**: The `src/viewer/viewer.js` module generates viewer pages for different file types, including PDF, Word, and PowerPoint.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.