import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Configuration globale d'Axios
axios.defaults.withCredentials = true;

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [resetError, setResetError] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8081/login', 
                {
                    username,
                    password
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    withCredentials: true
                }
            );

            // Sauvegarder le token dans le localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Rediriger vers la page d'accueil
            navigate('/');
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError(err.response?.data?.error || "Une erreur est survenue lors de la connexion");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetSuccess('');
        setIsResetting(true);

        try {
            const response = await axios.post('http://localhost:8081/reset-password', {
                email: resetEmail
            });

            setResetSuccess('Un email de réinitialisation a été envoyé à votre adresse email.');
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetEmail('');
                setResetSuccess('');
            }, 3000);
        } catch (err) {
            setResetError(err.response?.data?.error || "Une erreur est survenue lors de la réinitialisation");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh'
        }}>
            {/* Partie gauche - Background bleu avec texte */}
            <div style={{
                flex: '1',
                background: 'linear-gradient(135deg, #0061f2 0%, #0044c8 100%)',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Cercles décoratifs */}
                <div style={{
                    position: 'absolute',
                    bottom: '-100px',
                    right: '-100px',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                }}/>
                <div style={{
                    position: 'absolute',
                    bottom: '-50px',
                    right: '-50px',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                }}/>
                
                <h1 style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    fontWeight: 'bold'
                }}>
                    WELCOME
                </h1>
                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '2rem',
                    opacity: '0.9'
                }}>
                    GESTION DES APPARTEMENTS
                </h2>
                <p style={{
                    fontSize: '1rem',
                    opacity: '0.8',
                    maxWidth: '400px'
                }}>
                    Connectez-vous pour accéder à votre tableau de bord et gérer vos appartements en toute simplicité.
                </p>
            </div>

            {/* Partie droite - Formulaire de connexion */}
            <div style={{
                flex: '1',
                backgroundColor: 'white',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        color: '#2c3e50'
                    }}>
                        Sign in
                    </h2>
                    <p style={{
                        color: '#666',
                        marginBottom: '2rem'
                    }}>
                        Entrez vos identifiants pour vous connecter
                    </p>

                    {error && (
                        <div style={{
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#2c3e50'
                            }}>
                                Nom d'utilisateur
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                                placeholder="Entrez votre nom d'utilisateur"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#2c3e50'
                            }}>
                                Mot de passe
                            </label>
                            <div style={{
                                position: 'relative'
                            }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Entrez votre mot de passe"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'none',
                                        color: '#666',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showPassword ? 'Masquer' : 'Afficher'}
                                </button>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0061f2',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    padding: 0,
                                    textDecoration: 'underline'
                                }}
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#0061f2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Chargement...</span>
                                    </div>
                                    <span>Connexion en cours...</span>
                                </>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal de réinitialisation de mot de passe */}
            {showForgotPassword && (
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
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowForgotPassword(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#666'
                            }}
                        >
                            ×
                        </button>

                        <h3 style={{
                            color: '#2c3e50',
                            marginBottom: '1rem'
                        }}>
                            Réinitialisation du mot de passe
                        </h3>

                        {resetSuccess ? (
                            <div style={{
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                marginBottom: '1rem',
                                textAlign: 'center'
                            }}>
                                {resetSuccess}
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                {resetError && (
                                    <div style={{
                                        backgroundColor: '#ffebee',
                                        color: '#c62828',
                                        padding: '0.75rem',
                                        borderRadius: '4px',
                                        marginBottom: '1rem',
                                        textAlign: 'center'
                                    }}>
                                        {resetError}
                                    </div>
                                )}

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        color: '#2c3e50'
                                    }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '1rem'
                                        }}
                                        placeholder="Entrez votre adresse email"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isResetting}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#0061f2',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isResetting ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Chargement...</span>
                                            </div>
                                            <span>Envoi en cours...</span>
                                        </>
                                    ) : (
                                        'Réinitialiser le mot de passe'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login; 