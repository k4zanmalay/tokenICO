// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TTT is ERC20, Ownable {
    mapping(address => bool) private whitelisted;
    address public ICOAddress;
    bool public ICOActive;

    constructor() ERC20("TimelockTransferToken", "TTT") {
        _mint(_msgSender(), 1000000 * 10 ** decimals());
        whitelisted[_msgSender()] = true;
        }

    function whitelist(address member) onlyOwner public {
        whitelisted[member] = true;
    }

    function createICO(uint supply) public {
        ICOAddress = address(new ICO(address(this)));
        ICOActive = true;
        IICO(ICOAddress).setICOState(true);
        transfer(ICOAddress, supply);
        whitelisted[ICOAddress] = true;
    }

    function setICOState(bool state) onlyOwner public {
        IICO(ICOAddress).setICOState(state);
        ICOActive = state;
    }

    function transfer(address recipient, uint amount) public override returns(bool){
        if(ICOActive)
            require(whitelisted[_msgSender()], "Not authorized to transfer until the end of ICO");
        _transfer(_msgSender(), recipient, amount);
        return true;
    }
}

contract ICO {
    address tokenAddress;
    bool ICOActive;
    uint private constant TOKENS_PER_ETH_STAGE1 = 42 * 1e18;
    uint private constant TOKENS_PER_ETH_STAGE2 = 21 * 1e18;
    uint private constant TOKENS_PER_ETH_STAGE3 = 8 * 1e18;
    uint private stage1;
    uint private stage2;
    uint private stage3;


    constructor(address token) {
        stage1 = block.timestamp + 3 days;
        stage2 = 30 days + stage1;
        stage3 = 2 weeks + stage2;
        tokenAddress = token;
    }

    function setICOState(bool state) external {
        ICOActive = state;
    }

    receive () external payable {
        require(IERC20(tokenAddress).balanceOf(address(this)) > 0, "Out of tokens");
        require(ICOActive, "ICO closed");
        require(block.timestamp < stage3, "ICO closed");  
        if(block.timestamp >= stage2){
            IERC20(tokenAddress).transfer(msg.sender, TOKENS_PER_ETH_STAGE3 * msg.value / 1e18);
            return;
        }
        if(block.timestamp >= stage1){
            IERC20(tokenAddress).transfer(msg.sender, TOKENS_PER_ETH_STAGE2 * msg.value / 1e18);
            return;
        }
        IERC20(tokenAddress).transfer(msg.sender, TOKENS_PER_ETH_STAGE1 * msg.value/ 1e18);
    }
}

interface IICO {
    function ICOActive() external view returns(bool);
    function setICOState(bool) external;
}

