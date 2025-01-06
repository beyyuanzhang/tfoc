export interface NavItem {
    title: string
    href: string
    className?: string
  }
  
  export interface PortalRow {
    items: NavItem[]
  }
  
  export interface NavData {
    appearance: {
      backgroundColor: string
      textColor: string
      hoverLineColor: string
    }
    logo: {
      url: string
    }
    leftNavItems: NavItem[]
    portalRows: PortalRow[]
  }