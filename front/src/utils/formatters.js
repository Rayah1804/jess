export const formatMontant = (montant) => {
    if (montant >= 1000) {
        return `${(montant / 1000).toLocaleString('fr-FR', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 1 
        })}K Ar`;
    }
    return `${montant.toLocaleString('fr-FR')} Ar`;
}; 