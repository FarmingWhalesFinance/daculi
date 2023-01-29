import React from 'react'
import { NavLink } from 'react-router-dom'
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import classnames from 'classnames'

import CoinsIcon from '../../assets/coins-red.png'
import PickIcon from '../../assets/pick-grey.png'
import Logo from '../../assets/spacelogo.png'
import DaiLogo from '../../assets/dailogo.png'
import EthLogo from '../../assets/ethlogo.png'
import spacelogo from '../../assets/spacelogo.png'
import sidebar from './sidebarNew.module.scss'
import sidebarBackgroundLayer from './sidebarNew.module.scss'
import sidebarBackgroundLayerHidden from './sidebarNew.module.scss'
import sidebarHidden from './sidebarNew.module.scss'
import sidebarLogo from './sidebarNew.module.scss'
import sidebarNavList from './sidebarNew.module.scss'
import sidebarNavItem from './sidebarNew.module.scss'
import sidebarNavLink from './sidebarNew.module.scss'
import sidebarNavLinkIcon from './sidebarNew.module.scss'
import sidebarNavLinkActive from './sidebarNew.module.scss'
import closeMenuButton from './sidebarNew.module.scss'
import styles from './sidebarNew.module.scss'

import { openMenuHandler } from '../../actions/menuActions'
import { CloseButton } from '../'

const linksList = [
  { path: '/staking', exact: true, text: 'Genesis Staking', icon: CoinsIcon },
  // { path: '/farming', exact: true, text: 'Farming', icon: PickIcon },
]

function NavLinks({ linksList }) {
  return linksList.map(({ path, exact, text, icon }, idx) => (
    <li key={idx} className={styles.sidebarNavItem}>
      <NavLink
        activeclassName={styles.sidebarNavLinkActive}
        className={styles.sidebarNavLink}
        exact={exact}
        to={path}
      >
        <img className={styles.sidebarNavLinkIcon} src={icon} alt="#" />
        {text}
      </NavLink>
    </li>
  ))
}

export function SidebarNew() {
  const isMenuOpen = useSelector((state) => state.menuReducer.isOpen)
  const classNames = isMenuOpen ? styles.sidebar : classnames(styles.sidebar, styles.sidebarHidden)
  const backgroundLayesClassNames = isMenuOpen
    ? styles.sidebarBackgroundLayer
    : classnames(styles.sidebarBackgroundLayerHidden)

  const dispatch = useDispatch()

  const closeMenu = () => {
    dispatch(openMenuHandler(false))
  }

  return (
    <>
      <div onClick={closeMenu} className={backgroundLayesClassNames}></div>
      <div className={classNames}>
        <CloseButton onClick={closeMenu} className={styles.closeMenuButton} />
        <div className={styles.sidebarLogo}>
        <a  href="https://www.spacefinancearbi.com/" target="_blank"> <img src={Logo} alt="Space Finance" /></a>
        </div>

        <ul className={styles.sidebarNavList}>
          <NavLinks linksList={linksList} />
          <li className={styles.sidebarNavLink}> <img src={DaiLogo} alt="#" /><Link className={styles.sidebarNavLink} to={{ pathname: "https://genesisdai.spacefinancearbi.com/" }} target="_blank">DAI</Link></li>
          <li className={styles.sidebarNavLink}> <img src={EthLogo} alt="#" /><Link className={styles.sidebarNavLink} to={{ pathname: "https://genesisweth.spacefinancearbi.com/" }} target="_blank">wETH</Link></li>
        </ul>
      </div>
    </>
  )
}
