<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/0xdavinchee/hardhat-ts-template">
    <img src="images/logo.png" alt="Logo" width="420.69">
  </a>

  <h3 align="center">Hardhat TypeScript Template</h3>

  <p align="center">
    A simple hardhat template.
    <br />
    <a href="https://github.com/0xdavinchee/hardhat-ts-template"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/0xdavinchee/hardhat-ts-template">View Demo</a>
    ·
    <a href="https://github.com/0xdavinchee/hardhat-ts-template/issues">Report Bug</a>
    ·
    <a href="https://github.com/0xdavinchee/hardhat-ts-template/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

A simple hardhat template modeled off of running `npx hardhat init`. 

This project includes: 
- `hardhat-deploy`: this is a powerful plugin for deployment and testing, allows you to utilize your deploy for testing and makes it easy to deploy to live networks. Also includes neat features like dependencies (allows handling the case where one deployment is dependent on another).
- `hardhat-prettier`: a plugin that makes it easy to format solidity files based on rules set in `.prettierrc`.
  - `npx hardhat format`
- `hardhat-typechain`: a plugin that generates typings files for use in test files and possibly even on the front-end.
- `solidity-coverage`: a plugin that generates a coverage report on how much of your code has been tested.
  - `npx hardhat coverage`

The deploy script and test files have been modified to work in a way that takes full advantage of the features which `hardhat-deploy` offers.

### Built With

* [hardhat](https://hardhat.org)
* [hardhat-deploy](https://hardhat.org/plugins/hardhat-deploy.html)
* [hardhat-prettier](https://www.npmjs.com/package/hardhat-prettier)
* [hardhat-typechain](https://hardhat.org/plugins/hardhat-typechain.html)
* [solidity-coverage](https://hardhat.org/plugins/solidity-coverage.html)



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

You just need to have npm to use this project.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/0xdavinchee/hardhat-ts-template.git
   ```
2. Install NPM packages
   ```sh
   yarn install
   ```



<!-- USAGE EXAMPLES -->
## Usage

To run tests, first compile the project with `yarn compile` and then `yarn test`. If you would like to deploy your project, use `yarn deploy --network <NETWORK>`. Keep in mind, you must add this network to the `hardhat.config.ts` file with the necessary information for this to work.


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

0xdavinchee - [@0xdavinchee](https://twitter.com/0xdavinchee) - 0xdavinchee@gmail.com

Project Link: [https://github.com/0xdavinchee/hardhat-ts-template](https://github.com/0xdavinchee/hardhat-ts-template)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [Hardhat](https://hardhat.org)
* [Paul R Berg Solidity Template](https://github.com/paulrberg/solidity-template)





<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/0xdavinchee/hardhat-ts-template.svg?style=for-the-badge
[contributors-url]: https://github.com/0xdavinchee/hardhat-ts-template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/0xdavinchee/hardhat-ts-template.svg?style=for-the-badge
[forks-url]: https://github.com/0xdavinchee/hardhat-ts-template/network/members
[stars-shield]: https://img.shields.io/github/stars/0xdavinchee/hardhat-ts-template.svg?style=for-the-badge
[stars-url]: https://github.com/0xdavinchee/hardhat-ts-template/stargazers
[issues-shield]: https://img.shields.io/github/issues/0xdavinchee/hardhat-ts-template.svg?style=for-the-badge
[issues-url]: https://github.com/0xdavinchee/hardhat-ts-template/issues
[license-shield]: https://img.shields.io/github/license/0xdavinchee/hardhat-ts-template.svg?style=for-the-badge
[license-url]: https://github.com/0xdavinchee/hardhat-ts-template/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555