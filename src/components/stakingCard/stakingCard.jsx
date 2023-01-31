import React, { useState, useEffect } from 'react'
import classnames from 'classnames'
import equal from 'fast-deep-equal'

import DAO1Logo from '../../assets/white-logo6.png'
import ArrowIcon from '../../assets/arrow-down.png'

import card from './stakingCard.module.scss'
import cardWrapper from './stakingCard.module.scss'
import cardHead from './stakingCard.module.scss'
import cardHeadLogo from './stakingCard.module.scss'
import cardLabel from './stakingCard.module.scss'
import cardInfoText from './stakingCard.module.scss'
import cardName from './stakingCard.module.scss'
import cardNameText from './stakingCard.module.scss'
import cardStakingConditions from './stakingCard.module.scss'
import cardStakingConditionsItem from './stakingCard.module.scss'
import cardStakingList from './stakingCard.module.scss'
import cardStakingListEmpty from './stakingCard.module.scss'
import cardStakingItem from './stakingCard.module.scss'
import cardStakingItemHead from './stakingCard.module.scss'
import cardStakingItemInfo from './stakingCard.module.scss'
import cardStakingItemInfoBlock from './stakingCard.module.scss'
import cardStakingItemButtons from './stakingCard.module.scss'
import cardStakingItemDetails from './stakingCard.module.scss'
import cardStakingItemDetailsHide from './stakingCard.module.scss'
import cardStakingItemDetailsRow from './stakingCard.module.scss'
import cardStakingItemDetailsName from './stakingCard.module.scss'
import cardStakingItemDetailsValue from './stakingCard.module.scss'
import cardArrowButton from './stakingCard.module.scss'
import cardArrowButtonActive from './stakingCard.module.scss'
import cardFooter from './stakingCard.module.scss'
import cardTatalStaked from './stakingCard.module.scss'
import cardTatalStakedValue from './stakingCard.module.scss'
import cardButton from './stakingCard.module.scss'
import stakeModal from './stakingCard.module.scss'
import stakeModalTitle from './stakingCard.module.scss'
import stakeModalInputContainer from './stakingCard.module.scss'
import stakeModalInput from './stakingCard.module.scss'
import stakeModalMaxButton from './stakingCard.module.scss'
import errorMessage from './stakingCard.module.scss'
import stakeModalBalance from './stakingCard.module.scss'
import hoverLoader from './stakingCard.module.scss'
import styles from './stakingCard.module.scss'

import { Button, Modal, Title, Input, Spinner, TxLoader } from '../'
import { withFixedStakingApi } from '../../services/staking/FixedStaking'

function StakingCardPure({ api, APY }) {
  const { getData, stake, unstake, harvest, approve } = api
  const [stakeDurationDays, setStakeDurationDays] = useState(0)
  const [yieldRate, setYieldRate] = useState(0)
  const [stakingHistory, setStakingHistory] = useState([])
  const [totalStaked, setTotalStaked] = useState(0)
  const [tokensBalance, setTokensBalance] = useState(0)
  const [allowance, setAllowance] = useState(0)
  const [stakeAmount, setStakeAmount] = useState('0.0')
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)
  const [visibleDetailedBlock, setVisibleDetailedBlock] = useState(null)
  const [allowanceEnough, setAllowanceEnough] = useState(true)
  const [inputValidity, setInputValidity] = useState(false)
  const [hoverLoaderVisible, setHoverLoaderVisible] = useState(true)

  const [modalLoaderVisible, setModalLoaderVisible] = useState(false)
  const [modalTxHash, setModalTxHash] = useState(null)
  const [modalErrorMessage, setModalErrorMessage] = useState(null)

  const [cardLoaderVisible, setCardLoaderVisible] = useState(false)
  const [cardTxHash, setCardTxHash] = useState(null)
  const [cardErrorMessage, setCardErrorMessage] = useState(null)
  const [cardPendingTxAmount, setCardPendingTxAmount] = useState(0)

  useEffect(() => {
    getData()
      .then(
        ({
          stakeDurationDays,
          yieldRate,
          stakes,
          totalStaked,
          tokensBalance,
          allowance,
        }) => {
          setHoverLoaderVisible(false)
          setStakeDurationDays(stakeDurationDays)
          setYieldRate(yieldRate)
          setStakingHistory(stakes)
          setTotalStaked(totalStaked)
          setTokensBalance(tokensBalance)
          setAllowance(allowance)
        },
      )
      .catch((err) => console.log(err))

    // Rerender component when stakes data is changed
    const checkUpdateInterval = setInterval(() => {
      getData()
        .then(({ stakes, totalStaked, tokensBalance: tokensBalanceNew }) => {
          if (tokensBalanceNew !== tokensBalance) {
            setTokensBalance(tokensBalanceNew)
          }

          if (stakingHistory) {
            for (let i = 0; i < stakes.length; i++) {
              if (!equal(stakes[i], stakingHistory[i])) {
                setStakingHistory(stakes)
                setTotalStaked(totalStaked)
                return
              }
            }
          }
        })
        .catch((err) => console.log(err))
    }, 2000)

    return () => {
      clearInterval(checkUpdateInterval)
    }
  }, [])

  useEffect(() => {
    const stakeAmountNumber = Number(stakeAmount.replaceAll(',', '.'))

    if (isNaN(stakeAmountNumber) || stakeAmountNumber <= 0) {
      setInputValidity(false)
    } else {
      setInputValidity(true)
    }

    if (!isNaN(stakeAmountNumber)) {
      setAllowanceEnough(stakeAmountNumber <= Number(allowance))
      return
    }

    setAllowanceEnough(true)
  }, [stakeAmount, allowance])

  const accordionClickHandler = (id) => {
    if (id === visibleDetailedBlock) {
      setVisibleDetailedBlock(null)
      return
    }

    setVisibleDetailedBlock(id)
  }

  const stakeAmountHandler = (e) => {
    e.preventDefault()
    setStakeAmount(e.target.value)
  }

  const approveHandler = () => {
    setModalLoaderVisible(true)
    setModalTxHash(null)
    setModalErrorMessage(null)

    approve()
      .then((tx) => {
        setModalTxHash(tx.hash)

        tx.wait()
          .then(() => {
            getData().then(({ allowance }) => {
              setModalTxHash(null)
              setModalLoaderVisible(false)
              setAllowance(allowance)
            })
          })
          .catch((err) => {
            setModalTxHash(null)
            setModalErrorMessage(String(err))
            console.log(err)
          })
      })
      .catch((err) => {
        setModalTxHash(null)
        setModalErrorMessage(String(err.message))
        console.log(err)
      })
  }

  const stakeHandler = () => {
    if (inputValidity) {
      setModalLoaderVisible(true)
      setModalTxHash(null)
      setModalErrorMessage(null)

      stake(String(stakeAmount))
        .then((tx) => {
          setModalTxHash(tx.hash)

          tx.wait()
            .then(() => {
              setModalTxHash(null)
              setIsStakeModalOpen(false)
              setModalLoaderVisible(false)
            })
            .catch((err) => {
              setModalTxHash(null)
              setModalErrorMessage(String(err))
              console.log(err)
            })
        })
        .catch((err) => {
          setModalTxHash(null)
          setModalErrorMessage(String(err.message))
          console.log(err)
        })
    }
  }

  const unstakeHandler = (staked, idx) => {
    if (staked) {
      setCardLoaderVisible(true)
      setCardTxHash(null)
      setCardErrorMessage(null)

      unstake(idx)
        .then((tx) => {
          setCardTxHash(tx.hash)
          setCardPendingTxAmount(cardPendingTxAmount + 1)

          tx.wait()
            .then(() => {
              setCardPendingTxAmount(cardPendingTxAmount - 1)

              if (cardPendingTxAmount === 0) {
                setCardTxHash(null)
                setCardLoaderVisible(false)
              }
            })
            .catch((err) => {
              setCardPendingTxAmount(cardPendingTxAmount - 1)

              if (cardPendingTxAmount === 0) {
                setCardTxHash(null)
                setCardErrorMessage(String(err))
              }
              console.log(err)
            })
        })
        .catch((err) => {
          setCardTxHash(null)
          setCardErrorMessage("You must wait at least 3 hours to unstake (anti-whale dumping prevention)")
          console.log(err)
        })
    }
  }

  const harvestHandler = (allowHarvest, idx) => {
    if (allowHarvest) {
      setCardLoaderVisible(true)
      setCardTxHash(null)
      setCardErrorMessage(null)
      setCardPendingTxAmount(cardPendingTxAmount + 1)

      harvest(idx)
        .then((tx) => {
          setCardTxHash(tx.hash)

          tx.wait()
            .then(() => {
              setCardPendingTxAmount(cardPendingTxAmount - 1)

              setCardTxHash(null)
              setCardLoaderVisible(false)
            })
            .catch((err) => {
              setCardPendingTxAmount(cardPendingTxAmount - 1)

              if (cardPendingTxAmount === 0) {
                setCardTxHash(null)
                setCardErrorMessage(String(err))
              }
              console.log(err)
            })
        })
        .catch((err) => {
          setCardTxHash(null)
          setCardErrorMessage(String(err.message))
          console.log(err)
        })
    }
  }

  const StakingHistory = () =>
    !stakingHistory || stakingHistory.length === 0 ? (
      <div className={styles.cardStakingListEmpty}>Empty! No information</div>
    ) : (
      stakingHistory.map(
        (
          { staked, stakedAmount, harvestable, allowHarvest, expires, details },
          idx,
        ) => {
          const isActive = visibleDetailedBlock === idx
          const hiddenClassNames = classnames(
            styles.cardStakingItemDetails,
            styles.cardStakingItemDetailsHide,
          )
          const detailsClassNames = isActive
            ? styles.cardStakingItemDetails
            : hiddenClassNames
          const activeArrowClassNames = classnames(
            styles.cardArrowButton,
            styles.cardArrowButtonActive,
          )
          const arrowButtonClassnames = isActive
            ? activeArrowClassNames
            : styles.cardArrowButton

          return (
            <div key={idx} className={styles.cardStakingItem}>
              <div className={styles.cardStakingItemHead}>
                <div className={styles.cardStakingItemInfo}>
                  <div className={styles.cardStakingItemInfoBlock}>
                    <div className={styles.cardLabel}>DAI Staked</div>
                    <div className={styles.cardInfoText}>{stakedAmount}</div>
                  </div>
                  {/* <div className={styles.cardStakingItemInfoBlock}>
                    <div className={styles.cardLabel}>Harvestable</div>
                    <div className={styles.cardInfoText}>{harvestable}</div>
                  </div> */}
                  {/* <div className={styles.cardStakingItemInfoBlock}>
                    <div className={styles.cardLabel}>Expires</div>
                    <div className={styles.cardInfoText}>{expires}</div>
                  </div> */}
                </div>
                <div className={styles.cardStakingItemButtons}>
                  {/* <Button
                    disabled={!allowHarvest}
                    onClick={() => harvestHandler(allowHarvest, idx)}
                    className={styles.cardButton}
                  >
                    Harvest
                  </Button> */}
                  <Button
                    disabled={!staked}
                    onClick={() => unstakeHandler(staked, idx)}
                    className={styles.cardButton}
                  >
                    Unstake
                  </Button>
                  <button
                    onClick={() => accordionClickHandler(idx)}
                    className={arrowButtonClassnames}
                  >
                    <img src={ArrowIcon} alt="Arrow" />
                  </button>
                </div>
              </div>

              <div className={detailsClassNames}>
                {details &&
                  details.map(({ name, value }, idx) => (
                    <div key={idx} className={styles.cardStakingItemDetailsRow}>
                      <div className={styles.cardStakingItemDetailsName}>{name}</div>
                      <div className={styles.cardStakingItemDetailsValue}>{value}</div>
                    </div>
                  ))}
              </div>
            </div>
          )
        },
      )
    )

  const SubmitButton = () => {
    return allowanceEnough ? (
      <Button disabled={!inputValidity} onClick={stakeHandler}>
        Stake
      </Button>
    ) : (
      <Button onClick={approveHandler}>Approve</Button>
    )
  }

  return (
    <div className={styles.cardWrapper}>
      <Modal
        isOpen={isStakeModalOpen}
        closeHandler={() => setIsStakeModalOpen(false)}
      >
        <div className={styles.stakeModal}>
          <Title className={styles.stakeModalTitle} level={3}>
            Stake DAI
          </Title>
          <div className={styles.stakeModalInputContainer}>
            <Input
              onChange={stakeAmountHandler}
              value={stakeAmount}
              className={styles.stakeModalInput}
            />
            <Button
              className={styles.stakeModalMaxButton}
              onClick={() => {
                setStakeAmount(String(tokensBalance))
              }}
            >
              Max
            </Button>
          </div>
          {!inputValidity && (
            <span className={styles.errorMessage}>
              Value must be a number greater than 0
            </span>
          )}

          <span className={styles.stakeModalBalance}>Balance: {tokensBalance}</span>

          {modalLoaderVisible ? (
            <TxLoader
              txHash={modalTxHash}
              closeHandler={() => setModalLoaderVisible(false)}
              errorMessage={modalErrorMessage}
            />
          ) : (
            <SubmitButton />
          )}
        </div>
      </Modal>
      <div className={styles.card}>
        {hoverLoaderVisible && (
          <div className={styles.hoverLoader}>
            <Spinner />
          </div>
        )}
        <div className={styles.cardHead}>
          <div className={styles.cardHeadLogo}>
            <img src={DAO1Logo} alt="DAI" />
          </div>
          <div className={styles.cardName}>
            <span className={styles.cardLabel}>STAKING POOL</span>
            <span className={styles.cardNameText}>
              DAI
            </span>
          </div>
        </div>

        <div className={styles.cardStakingConditions}>
          <div className={styles.cardStakingConditionsItem}>
            <div className={styles.cardLabel}>APY</div>
            <div className={styles.cardInfoText}>56249106542.51%</div>
          </div>
         {/*  <div className={styles.cardStakingConditionsItem}>
            <div className={styles.cardLabel}>Lock Period</div>
            <div className={styles.cardInfoText}>
             7 days
            </div>
          </div> */}
          <div className={styles.cardStakingConditionsItem}>
            <div className={styles.cardLabel}>Staking/unstaking FEE</div>
            <div className={styles.cardInfoText}>0.5%</div>
          </div>
        
        </div>

        <div className={styles.cardStakingList}>
          {cardLoaderVisible && (
            <TxLoader
              txHash={cardTxHash}
              closeHandler={() => setCardLoaderVisible(false)}
              errorMessage={cardErrorMessage}
            />
          )}

          <StakingHistory />
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.cardTatalStaked}>
            <div className={styles.cardLabel}>Total Staked:</div>
            <div className={styles.cardTatalStakedValue}>{totalStaked} DAI</div>
          </div>
          <Button
            onClick={() => setIsStakeModalOpen(true)}
            className={styles.cardButton}
          >
            Stake
          </Button>
        </div>
      </div>
    </div>
  )
}

export const StakingCard = withFixedStakingApi(StakingCardPure)