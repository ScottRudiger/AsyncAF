import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';

import AsyncAF from '../../../dist/async-af';

chai.use(chaiAsPromised);

describe('reduceAF method', () => {
  it('should have the same arity as native reduce', () => {
    expect(AsyncAF([]).reduceAF.length).to.equal([].reduce.length);
    expect(AsyncAF.prototype.reduceAF.length)
      .to.equal(Array.prototype.reduce.length);
  });

  context('should work on an array of non-promises', () => {
    const nums = [1, 2, 4];
    it('and apply a function to each', async () => {
      const numsTimes2 = [];
      await AsyncAF(nums).reduceAF((_, num) => {
        numsTimes2.push(num * 2);
      });
      expect(numsTimes2).to.eql([2, 4, 8]);
    });
    it('and return the correct type', async () => {
      expect(await AsyncAF(nums).reduceAF((sum, num) => sum + num))
        .to.be.a('number').and.equal(7);
    });
    it('and work with an initialValue', async () => {
      expect(await AsyncAF(nums).reduceAF((obj, num, i) => ({
        ...obj, [i]: num,
      }), {})).to.eql({0: 1, 1: 2, 2: 4});
    });
  });

  context('should work on an array of promises', () => {
    const nums = [
      new Promise(resolve => resolve(1)),
      new Promise(resolve => resolve(2)),
      new Promise(resolve => resolve(4)),
    ];
    it('and apply a function to each', async () => {
      const numsTimes2 = [];
      await AsyncAF(nums).reduceAF((_, num) => {
        numsTimes2.push(num * 2);
      });
      expect(numsTimes2).to.eql([2, 4, 8]);
    });
    it('and return the correct type', async () => {
      expect(await AsyncAF(nums).reduceAF((sum, num) => sum + num))
        .to.be.a('number').and.equal(7);
    });
    it('and work with an initialValue', async () => {
      expect(await AsyncAF(nums).reduceAF((obj, num, i) => ({
        ...obj, [i]: num,
      }), {})).to.eql({0: 1, 1: 2, 2: 4});
    });
  });

  context('should work on an array of Promise.resolve calls', () => {
    const nums = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(4)];
    it('and apply a function to each', async () => {
      const numsTimes2 = [];
      await AsyncAF(nums).reduceAF((_, num) => {
        numsTimes2.push(num * 2);
      });
      expect(numsTimes2).to.eql([2, 4, 8]);
    });
    it('and return the correct type', async () => {
      expect(await AsyncAF(nums).reduceAF((sum, num) => sum + num))
        .to.be.a('number').and.equal(7);
    });
    it('and work with an initialValue', async () => {
      expect(await AsyncAF(nums).reduceAF((obj, num, i) => ({
        ...obj, [i]: num,
      }), {})).to.eql({0: 1, 1: 2, 2: 4});
    });
  });

  context('should process elements in order and in parallel', () => {
    const clock = sinon.useFakeTimers();
    const nums = [
      new Promise(resolve => setTimeout(() => resolve(1), 2000)),
      new Promise(resolve => setTimeout(() => resolve(2), 1000)),
      new Promise(resolve => setTimeout(() => resolve(4), 0)),
    ];
    clock.tick(2000); // tick exactly 2000 to be sure elements are processed in parallel
    it('and apply a function to each', async () => {
      const numsTimes2 = [];
      await AsyncAF(nums).reduceAF((_, num) => {
        numsTimes2.push(num * 2);
      });
      expect(numsTimes2).to.eql([2, 4, 8]);
    });
    it('and work with indices/array arguments', async () => {
      const result = [];
      await AsyncAF(nums).reduceAF(async (_, num, i, arr) => {
        result.push(num + (await arr[i - 1] || 0));
      });
      expect(result).to.eql([1, 3, 6]);
    });
    clock.restore();
  });

  it('should reject with TypeError: undefined is not a function', async () => {
    await expect(AsyncAF([1, 2]).reduceAF()).to.eventually.be.rejected.and.has.property(
      'message',
      'undefined is not a function',
    );
  });
  it('should reject when not called on an Array', async () => {
    await expect(AsyncAF(null).reduceAF((_, el) => el)).to.eventually.be.rejected.and.has.property(
      'message',
      'Cannot read property \'reduceAF\' of null',
    );
    await expect(AsyncAF(undefined).reduceAF((_, el) => el)).to.eventually.be.rejected.and.has.property(
      'message',
      'Cannot read property \'reduceAF\' of undefined',
    );
    await expect(AsyncAF({}).reduceAF((_, el) => el)).to.eventually.be.rejected.and.has.property(
      'message',
      '[object Object].reduceAF is not a function',
    );
    await expect(AsyncAF('string').reduceAF((_, el) => el)).to.eventually.be.rejected.and.has.property(
      'message',
      'string.reduceAF is not a function',
    );
  });
  it('should reject when given an empty array and no initial value', async () => {
    await expect(AsyncAF([]).reduceAF((_, el) => el)).to.eventually.be.rejected.and.has.property(
      'message',
      'reduceAF of empty array with no initial value',
    );
  });
});
