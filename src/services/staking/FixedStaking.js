import React from 'react'
import { ethers } from 'ethers'

import FixedStakingAbi from '../../abi/staking/FixedStaking.json'
import DAO1Abi from '../../abi/staking/DAO1.json'

import {
  formatAttoToToken,
  formatTokenToAtto,
} from '../../utils/ether-utilities'
import { formatDate } from '../../utils/formatDate'

export function withFixedStakingApi(Component) {
  return function ({ contractAddress, tokenContract, ...props }) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      contractAddress,
      FixedStakingAbi,
      signer,
    )
    const DAO1Signer = new ethers.Contract(tokenContract, DAO1Abi, signer)

    async function getData() {
      try {
        const stakeDurationDays = (
          await contract.stakeDurationDays()
        ).toNumber()
        const yieldRate = (await contract.yieldRate()).toNumber() / 100
        const signerAddress = await signer.getAddress()
        const stakesLength = (
          await contract.getStakesLength(signerAddress)
        ).toNumber()
        const stakes = []
        let totalStaked = ethers.BigNumber.from('0')
        const tokensBalance = (
          await DAO1Signer.balanceOf(signerAddress)
        ).toString()
        const allowance = (
          await DAO1Signer.allowance(signerAddress, contractAddress)
        ).toString()
        for (let i = 0; i < stakesLength; i++) {
          const stake = await contract.getStake(signerAddress, i)
          stakes.push(stake)
        }
        const formatedStakes = stakes.map((stake, idx) => {
          const {
            staked,
            endTime,
            harvestableYield,
            harvestedYiels,
            lastHarvestTime,
            stakedAmount,
            startTime,
            totalYield,
          } = {
            staked: stake.staked,
            endTime: stake.endTime.toString(),
            harvestableYield: formatAttoToToken(stake.harvestableYield),
            harvestedYiels: formatAttoToToken(stake.harvestedYield),
            lastHarvestTime: stake.lastHarvestTime.toString(),
            stakedAmount: formatAttoToToken(stake.stakedAmount),
            startTime: stake.startTime.toString(),
            totalYield: formatAttoToToken(stake.totalYield),
          }
          const lockedYield = formatAttoToToken(
            // stake.totalYield.sub(stake.harvestableYield),
            stake.totalYield,
          )
          totalStaked = totalStaked.add(stake.stakedAmount)
          const expired = endTime * 1000 < Date.now()
          return {
            staked,
            stakedAmount,
            harvestable: harvestableYield,
            allowHarvest: !stake.harvestableYield.isZero(),
            expires: expired ? 'Expired' : formatDate(endTime),
            details: [
              { name: 'Stake Identifier', value: idx },
              { name: 'Stake status', value: staked ? 'Active' : 'Not active' },
              {
                name: 'Start date (stake placement)',
                value: formatDate(startTime, true),
              },
              // {
              //   name: 'End date (stake expiration)',
              //   value: formatDate(endTime, true),
              // },
              { name: 'Staked amount', value: stakedAmount },

              // {
              //   name: 'Total yield (for entire period)',
              //   value: `1.55% or ${totalYield} DAO1`,
              // },
              {
                name: 'Generated yield: ',
                value: harvestableYield,
              },
              // { name: 'Released yield (harvest + harvestable)', value: 0.674 },
              // { name: 'Harvested yield', value: harvestedYiels },
              // {
              //   name: 'Harvestable now (available for withdrawal)',
              //   value: harvestableYield,
              // },
            ],
          }
        })
        return {
          stakeDurationDays,
          yieldRate,
          totalStaked: formatAttoToToken(totalStaked),
          stakes: formatedStakes,
          tokensBalance: formatAttoToToken(tokensBalance),
          allowance,
        }
      } catch (error) {
        console.log(error)
      }
    }

    async function stake(amount) {
      try {
        const amountBN = formatTokenToAtto(amount)

        return contract.stake(amountBN)
      } catch (error) {
        console.log(error)
      }
    }

    async function unstake(id) {
      try {
        return contract.unstake(id)
      } catch (error) {
        console.log(error)
      }
    }

    async function harvest(id) {
      try {
        return contract.harvest(id)
      } catch (error) {
        console.log(error)
      }
    }

    async function approve() {
      try {
        return DAO1Signer.approve(contractAddress, ethers.constants.MaxUint256)
      } catch (error) {
        console.log(error)
      }
    }

    return (
      <Component
        api={{ getData, stake, unstake, harvest, approve }}
        {...props}
      />
    )
  }
}
