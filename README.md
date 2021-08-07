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
  <a href="https://github.com/0xdavinchee/farmer">
    <img src="images/logo.png" alt="Logo" width="150">
  </a>

  <h3 align="center">Farmer</h3>

  <p align="center">
    A collection of smart contracts to aid in my deep dive into becoming a farmer.
    <br />
    <a href="https://github.com/0xdavinchee/farmer"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/0xdavinchee/farmer">View Demo</a>
    ·
    <a href="https://github.com/0xdavinchee/farmer/issues">Report Bug</a>
    ·
    <a href="https://github.com/0xdavinchee/farmer/issues">Request Feature</a>
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

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

A collection of farming contracts which will be used to optimize yield.

### Built With

-   [hardhat](https://hardhat.org)

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

You just need to have npm to use this project.

-   npm
    ```sh
    npm install npm@latest -g
    ```

You will also need a few `.env` variables for things to work properly:

-   `INFURA_API_KEY`: used for deployment and mainnet forking.
-   `TEST_ACCOUNT`: private key of a test account you will use to deploy the contracts for testing/mainnet.
-   `WHALE_TEST_ADDRESS`: public address of an account (preferably someone with a good amount of funds) which you can test off a fork.
-   `MINI_CHEF_V2_ADDRESS`: `0x0769fd68dFb93167989C6f7254cd0D766Fb2841F` (on Polygon at least)

### Installation

1. Clone the repo
    ```sh
    git clone https://github.com/0xdavinchee/farmer.git
    ```
2. Install NPM packages
    ```sh
    yarn install
    ```

<!-- USAGE EXAMPLES -->

## Usage

1. To use this without a frontend, you will to know how to interact with contracts using the hardhat console: https://ethereum.stackexchange.com/questions/93657/how-to-interact-with-the-functions-of-my-smart-contract-in-hardhat.
2. You also have the option of deploying and then verifying the contract and interacting with it through etherscan/polygonscan/etc.
3. To run tests, you will have to do this on a fork of mainnet as I don't believe any of the testnets have farms. The forking config is already set up in `hardhat.config.ts`. The variables you will change in `farmer-tests.test.ts` are: `chainId`, `pid`, `independentAddress`, `dependentAddress`, `independentTokenInfo`, `dependentTokenInfo`, `rewardTokenA` and `rewardTokenB`. This will allow you to test the SushiFarmer contract on other chains, with other farms and different reward types. Use the command `yarn test --network localhost`.

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

Project Link: [https://github.com/0xdavinchee/farmer](https://github.com/0xdavinchee/farmer)

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

-   [Hardhat](https://hardhat.org)
-   [Paul R Berg Solidity Template](https://github.com/paulrberg/solidity-template)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/0xdavinchee/farmer.svg?style=for-the-badge
[contributors-url]: https://github.com/0xdavinchee/farmer/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/0xdavinchee/farmer.svg?style=for-the-badge
[forks-url]: https://github.com/0xdavinchee/farmer/network/members
[stars-shield]: https://img.shields.io/github/stars/0xdavinchee/farmer.svg?style=for-the-badge
[stars-url]: https://github.com/0xdavinchee/farmer/stargazers
[issues-shield]: https://img.shields.io/github/issues/0xdavinchee/farmer.svg?style=for-the-badge
[issues-url]: https://github.com/0xdavinchee/farmer/issues
[license-shield]: https://img.shields.io/github/license/0xdavinchee/farmer.svg?style=for-the-badge
[license-url]: https://github.com/0xdavinchee/farmer/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
