import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from './styles/commonStyles';

function Add() {
    const [numApp, setNumApp] = useState('');
    const [design, setDesign] = useState('');
    const [loyer, setLoyer] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Animation d'entrée
        setIsVisible(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8081/appartement', {
                numApp,
                design,
                loyer: Number(loyer)
            });

            if (response.data.message === "Création réussie") {
                window.location.href = '/';
            } else {
                setError(response.data.error || "Erreur lors de l'ajout");
            }
        } catch (err) {
            console.error("Erreur lors de l'ajout:", err);
            setError(err.response?.data?.error || "Erreur lors de l'ajout de l'appartement");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => navigate('/'), 300);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                width: '90%',
                maxWidth: '500px',
                position: 'relative',
                transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'transform 0.3s ease-in-out'
            }}>
                <button 
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#666',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s',
                        ':hover': {
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                >
                    ×
                </button>

                <h2 style={{
                    ...commonStyles.title,
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    color: '#2c3e50',
                    fontSize: '1.8rem'
                }}>Ajouter un appartement</h2>
                
                {error && (
                    <div style={{
                        ...commonStyles.error,
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#fff5f5',
                        border: '1px solid #ffebee'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{
                        ...commonStyles.formGroup,
                        marginBottom: '1.5rem'
                    }}>
                        <label style={{
                            ...commonStyles.label,
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#2c3e50',
                            fontWeight: '500'
                        }}>Numéro d'appartement</label>
                        <input
                            type="text"
                            value={numApp}
                            onChange={(e) => setNumApp(e.target.value)}
                            style={{
                                ...commonStyles.input,
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                transition: 'border-color 0.2s',
                                ':focus': {
                                    borderColor: '#3498db',
                                    outline: 'none'
                                }
                            }}
                            required
                            placeholder="Ex: A101"
                        />
                    </div>

                    <div style={{
                        ...commonStyles.formGroup,
                        marginBottom: '1.5rem'
                    }}>
                        <label style={{
                            ...commonStyles.label,
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#2c3e50',
                            fontWeight: '500'
                        }}>Désignation</label>
                        <input
                            type="text"
                            value={design}
                            onChange={(e) => setDesign(e.target.value)}
                            style={{
                                ...commonStyles.input,
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                transition: 'border-color 0.2s'
                            }}
                            required
                            placeholder="Ex: Appartement vue mer"
                        />
                    </div>

                    <div style={{
                        ...commonStyles.formGroup,
                        marginBottom: '1.5rem'
                    }}>
                        <label style={{
                            ...commonStyles.label,
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#2c3e50',
                            fontWeight: '500'
                        }}>Loyer (Ar)</label>
                        <input
                            type="number"
                            value={loyer}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (Number(value) >= 0)) {
                                    setLoyer(value);
                                }
                            }}
                            style={{
                                ...commonStyles.input,
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                transition: 'border-color 0.2s'
                            }}
                            required
                            min="0"
                            placeholder="Ex: 200000"
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                        marginTop: '2rem'
                    }}>
                        <button 
                            type="button" 
                            onClick={handleClose}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                color: '#666',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                ':hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: '#3498db',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s',
                                ':hover': {
                                    backgroundColor: '#2980b9'
                                },
                                ':disabled': {
                                    backgroundColor: '#bdc3c7',
                                    cursor: 'not-allowed'
                                }
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Ajout en cours...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                    </svg>
                                    Ajouter
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Add; 