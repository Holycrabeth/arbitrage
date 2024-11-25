// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUniswapV2Router {
    function swapExactTokensForETH(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts);
    function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut,address[] calldata path,address to,uint deadline) external payable returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin,address[] calldata path,address to,uint deadline) external payable returns (uint[] memory amounts);
}

interface ISushiSwapRouter {
    function swapExactETHForTokens(uint amountOutMin,address[] calldata path,address to,uint deadline) external payable returns (uint[] memory amounts);
    function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts);
    function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
}

interface IWETH9 {
    function deposit() external payable;
    function withdraw(uint wad) external;
    function approve(address dst, uint wad) external returns (bool);
    function transfer(address dst, uint wad) external returns (bool);
    function transferFrom(address src, address dst, uint wad) external returns (bool);
    function balanceOf(address owner) external view returns (uint);
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MyContract {
    address private owner;
    address constant WETH_ADDRESS = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address constant SUSHISWAP_ROUTER_ADDRESS = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    IUniswapV2Router private uniswapRouter;
    ISushiSwapRouter private sushiswapRouter;

    constructor() {
        owner = msg.sender;
        uniswapRouter = IUniswapV2Router(UNISWAP_ROUTER_ADDRESS);
        sushiswapRouter = ISushiSwapRouter(SUSHISWAP_ROUTER_ADDRESS);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // Empty receive function
    receive() external payable {}

    // Empty fallback function
    fallback() external payable {}

    // New function to approve tokens
    function approveToken(address token, address spender, uint256 amount) external onlyOwner {
        require(IERC20(token).approve(spender, amount), "Approval failed");
    }

    function swap(address _address,uint256 _amountIn) external onlyOwner {
        IWETH9(WETH_ADDRESS).transferFrom(msg.sender, address(this), _amountIn); 
        // Buy the token on Uniswap with ETH
        address[] memory path = new address[](2);
        path[0] = WETH_ADDRESS;
        path[1] = _address;
        // Get the amount of tokens received
        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(_amountIn, 0, path, address(this), block.timestamp);
        uint256 amountOut = amounts[1];
        // Sell the token on Sushiswap with _address
        path[0] = _address;
        path[1] = WETH_ADDRESS;
        uint256[] memory amounts_1 = sushiswapRouter.swapExactTokensForTokens(amountOut,0, path, msg.sender, block.timestamp);
        uint256 amountOut_1 = amounts_1[1];
        require(amountOut_1 > _amountIn , "Arbitrage fail !");
        
    }
    // Withdraw a specific amount of any ERC20 token
    function withdrawToken(address tokenAddress, uint256 amount) external onlyOwner {
        uint256 contractBalance = IERC20(tokenAddress).balanceOf(address(this));
        require(amount <= contractBalance, "Insufficient balance in contract");
        IERC20(tokenAddress).transfer(msg.sender, amount);
    }

    // Withdraw all balance of any ERC20 token
    function withdrawAllTokens(address tokenAddress) external onlyOwner {
        uint256 contractBalance = IERC20(tokenAddress).balanceOf(address(this));
        IERC20(tokenAddress).transfer(msg.sender, contractBalance);
    }
    // Withdraw ETH from the contract
    function withdrawETH(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance in contract");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    // Withdraw all ETH stored in the contract
    function withdrawAllETH() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }
}
