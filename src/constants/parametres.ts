interface ParametreItem {
  label: string;
  path: string;
}

export const PARAMETRES: ParametreItem[] = [
  { label: "Paramétrage Utilisateur", path: "utilisateur" },
  { label: "Paramétrage Profil", path: "profil" },
  { label: "Paramétrage Autorisation", path: "autorisation" },
  { label: "Paramétrage Type Transaction", path: "type-transaction" },
];
