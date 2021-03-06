import { Address, ETHER_ADDRESS, OptimalRate } from '../../types';
import { DEXData, DexParams } from './dex-types';
import BigNumber from 'bignumber.js';

export default class Adapter {
  constructor(protected network: number, protected web3Provider: any, protected augustus?: any) {
  }

  isETHAddress = (address: string) => address.toLowerCase() === ETHER_ADDRESS.toLowerCase();

  static getDexData(_: OptimalRate, __: string): DEXData {
    throw new Error('not implemented!');
  };

  getNetworkFees(srcToken: Address, destToken: Address) {
    return '0';
  }

  getApproveCallData(srcToken: Address, srcAmount: string, exchange: Address) {
    const calldata = this.augustus.methods.approve(srcToken, exchange, srcAmount).encodeABI();

    return { callee: this.augustus._address, calldata, value: '0' };
  }

  protected swap(srcToken: Address, destToken: Address, data: DEXData, swapData: string, swapExchange: Address): DexParams {
    const approveCallData = this.getApproveCallData(srcToken, data.srcAmount, swapExchange);

    const callees = this.isETHAddress(srcToken) ? [swapExchange] : [approveCallData.callee, swapExchange];

    const calldata = this.isETHAddress(srcToken) ? [swapData] : [approveCallData.calldata, swapData];

    const networkFees = this.getNetworkFees(srcToken, destToken);

    const value = new BigNumber(data.srcAmount).plus(networkFees).toFixed(0);

    const values = this.isETHAddress(srcToken) ? [value] : ['0', networkFees];

    return {
      callees,
      calldata,
      values,
    };
  }

  async getBlock() {
    return this.web3Provider.eth.getBlock('latest');
  }

  async getDeadline() {
    const block = await this.getBlock();
    return <number>block.timestamp + 600;
  }

  async buildSwap(srcToken: Address, destToken: Address, data: Required<DEXData>): Promise<DexParams> {
    try {
      if (this.isETHAddress(srcToken)) {
        return this.ethToTokenSwap(srcToken, destToken, data);
      } else if (this.isETHAddress(destToken)) {
        return this.tokenToEthSwap(srcToken, destToken, data);
      } else {
        return this.tokenToTokenSwap(srcToken, destToken, data);
      }
    } catch (e) {
      throw new Error(e.message);
    }
  };

  protected async ethToTokenSwap(srcToken: Address, destToken: Address, data: DEXData): Promise<DexParams> {
    throw new Error('not implemented!');
  };

  protected async tokenToEthSwap(srcToken: Address, destToken: Address, data: DEXData): Promise<DexParams> {
    throw new Error('not implemented!');
  };

  protected async tokenToTokenSwap(srcToken: Address, destToken: Address, data: DEXData): Promise<DexParams> {
    throw new Error('not implemented!');
  };
}
