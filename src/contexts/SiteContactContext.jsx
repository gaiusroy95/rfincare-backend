import React, { createContext, useContext, useEffect, useState } from 'react';
import { homepageService } from '../services/homepageService';

const DEFAULT_CONTACT = {
  tagline:
    'Intelligent loan matching that works for you. Transparency in every step. Your financial success is our mission.',
  email: 'support@rfincare.com',
  phone: '7300069952',
  emails: ['support@rfincare.com'],
  phones: ['7300069952'],
  registeredOfficeLabel: 'Regist. Office:',
  registeredAddress: 'Ward No 2, Baniya Bass, Mahajan, Bikaner, Rajasthan-334606 India',
  branchOfficeLabel: 'Corporate Office:',
  branchAddress:
    'Shop no 3, 2nd Floor, Shiv Market, Near Kirtistambh circle, Ganganagar Road, Bikaner -334001 India',
  offices: [
    {
      title: 'Reg. Office',
      address: 'Ward No 2, Baniya Bass, Mahajan, Bikaner, Rajasthan-334606 India',
    },
    {
      title: 'Circle Office',
      address:
        'M125, Bharat Mata Chowk, Ganesh Nagar Ext. Niwaru Road, Jhotwara, Jaipur-302012 India',
    },
    {
      title: 'Corporate Office',
      address:
        'Shop no 3, 2nd Floor, Shiv Market, Near Kirtistambh circle, Ganganagar Road, Bikaner -334001 India',
    },
  ],
  socialFacebook: '#',
  socialTwitter: '#',
  socialLinkedin: '#',
  socialInstagram: '#',
};

const SiteContactContext = createContext({
  contact: DEFAULT_CONTACT,
  loading: true,
  refresh: async () => {},
});

export function useSiteContact() {
  return useContext(SiteContactContext);
}

export function SiteContactProvider({ children }) {
  const [contact, setContact] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await homepageService.getSiteContact();
      if (data) setContact({ ...DEFAULT_CONTACT, ...data });
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
    const run = () => refresh();
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 50);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <SiteContactContext.Provider value={{ contact, loading, refresh }}>
      {children}
    </SiteContactContext.Provider>
  );
}
