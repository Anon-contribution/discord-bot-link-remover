import path from "node:path";
import { fileURLToPath } from 'url';

export const levenshteinDistance = (mot1, mot2) => {
    if (mot1 === mot2) {
      return 0;
    }
  
    const longueurMot1 = mot1.length;
    const longueurMot2 = mot2.length;
  
    if (longueurMot1 === 0) {
      return longueurMot2;
    }
  
    if (longueurMot2 === 0) {
      return longueurMot1;
    }
  
    const matrice = [];
  
    for (let i = 0; i <= longueurMot1; i++) {
      matrice[i] = [i];
    }
  
    for (let j = 1; j <= longueurMot2; j++) {
      matrice[0][j] = j;
  
      for (let i = 1; i <= longueurMot1; i++) {
        if (mot1[i - 1] === mot2[j - 1]) {
          matrice[i][j] = matrice[i - 1][j - 1];
        } else {
          matrice[i][j] = 1 + Math.min(
            matrice[i - 1][j],
            matrice[i][j - 1],
            matrice[i - 1][j - 1]
          );
        }
      }
    }
  
    return matrice[longueurMot1][longueurMot2];
  }

  // need fine tuning
  // This method consider a string as a URL the Window.URL can parse it
  export const isURL = (str) => {
    try {
      const url = new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  export const dirname = (importMetaUrl) => {
    try {
      const __filename = fileURLToPath(importMetaUrl); // get the resolved path to the file
      return path.dirname(__filename); // get the name of the directory      
    } catch (error) {
      throw error;
    }
  }