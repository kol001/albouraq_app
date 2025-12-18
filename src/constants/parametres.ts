import {
  FiUsers,
  FiUser,
  FiShield,
  FiSettings,
  FiFileText,
  FiDollarSign,
  FiHash,
  FiLayers,
  FiRepeat,
  FiTag,
  FiBox,
  FiCreditCard,
  FiBriefcase,
} from "react-icons/fi";

import type { IconType } from "react-icons";

export interface ParametreItem {
  label: string;
  path: string;
  icon: IconType;
}

export const PARAMETRES: ParametreItem[] = [
  { label: "Paramétrage Privilege", path: "privilege", icon: FiShield },
  { label: "Paramétrage Utilisateur", path: "utilisateur", icon: FiUsers },
  { label: "Paramétrage Profil", path: "profil", icon: FiUser },
  { label: "Paramétrage Autorisation", path: "autorisation", icon: FiSettings },

  { label: "Paramétrage Type Transaction", path: "type-transaction", icon: FiRepeat },
  { label: "Paramétrage Transaction", path: "transaction", icon: FiFileText },

  // { label: "Paramétrage Commission", path: "commission", icon: FiDollarSign },
  // { label: "Paramétrage Modèle", path: "modele", icon: FiLayers },
  // { label: "Paramétrage Numérotation", path: "numerotation", icon: FiHash },

  // { label: "Paramétrage Miles", path: "miles", icon: FiTag },
  // { label: "Paramétrage Pièces", path: "pieces", icon: FiBox },

  // { label: "Paramétrage Devise Transaction", path: "devise-transaction", icon: FiCreditCard },

  // { label: "Paramétrage Client Facturé", path: "client-facture", icon: FiUser },
  // { label: "Paramétrage Client Bénéficiaire", path: "client-beneficiaire", icon: FiUsers },

  // { label: "Paramétrage Fournisseurs", path: "fournisseurs", icon: FiBriefcase },

  // { label: "Paramétrage Sous Catégorie Article", path: "sous-categorie-article", icon: FiLayers },
  // { label: "Paramétrage Article", path: "article", icon: FiBox },
];

