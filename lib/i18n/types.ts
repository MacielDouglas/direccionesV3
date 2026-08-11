export const locales = ["pt", "es"] as const;

export type Locale = (typeof locales)[number];

export type I18nDictionary = {
  common: {
    appName: string;
    home: string;
    addresses: string;
    myCards: string;
    agenda: string;
    profile: string;
    admin: string;
    close: string;
    cancel: string;
    save: string;
    confirm: string;
    delete: string;
    back: string;
    logout: string;
    logoutConfirm: string;
    loading: string;
    language: string;
    all: string;
    search: string;
  };
  navigation: {
    homeLabel: string;
    addressesLabel: string;
    myCardsLabel: string;
    agendaLabel: string;
    profileLabel: string;
    surveyLabel: string;
    newAddress: string;
    allAddresses: string;
    administration: string;
  };
  header: {
    menu: string;
    closeMenu: string;
    navigation: string;
    mainMenu: string;
    goToHome: string;
  };
  footer: {
    tagline: string;
    terms: string;
    profile: string;
    copyright: string;
  };
  login: {
    title: string;
    welcome: string;
    withGoogle: string;
    loginDescription: string;
    loginWithGoogle: string;
    signingIn: string;
    loginError: string;
    chooseLanguage: string;
  };
  home: {
    welcome: string;
    chooseOption: string;
    notInGroup: string;
    talkToAdmin: string;
    thanks: string;
  };
  addresses: {
    allTitle: string;
    allDescription: string;
    searchHint: string;
    sendNew: string;
    searchPlaceholder: string;
    status: string;
    type: string;
    active: string;
    inactive: string;
    confirmed: string;
    notConfirmed: string;
    cardActive: string;
    cardInactive: string;
    noResults: string;
    clearFilters: string;
    resultCount: string;
    deletePending: string;
    pendingDeletion: string;
    details: string;
    edit: string;
  };
  cards: {
    title: string;
    active: string;
    free: string;
    assigned: string;
    assignedTo: string;
    noCards: string;
    cardNumber: string;
    addressesCount: string;
    assign: string;
    return: string;
    assignSuccess: string;
  };
  agenda: {
    title: string;
    today: string;
    loading: string;
    noEvents: string;
    createEvent: string;
    editEvent: string;
    exportPdf: string;
    exit: string;
    type: string;
    territory: string;
    conductor: string;
    pastEvents: string;
    showMore: string;
  };
  survey: {
    title: string;
    pending: string;
    suggested: string;
    confirmed: string;
    cancelled: string;
    confirmMarking: string;
    clear: string;
    sendMarkings: string;
    suggestionMode: string;
  };
  user: {
    title: string;
    email: string;
    name: string;
    saveChanges: string;
    languagePreference: string;
  };
  admin: {
    title: string;
    dashboard: string;
    users: string;
    cards: string;
    agenda: string;
    invitations: string;
    organizations: string;
    createNew: string;
  };
  organizations: {
    selectOrg: string;
    selectOrgHint: string;
    createOrg: string;
  };
  errors: {
    generic: string;
    sessionExpired: string;
  };
};
