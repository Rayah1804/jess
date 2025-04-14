import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/register', {
                username: formData.username,
                password: formData.password,
                email: formData.email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || "Une erreur est survenue lors de l'inscription");
        } finally {
            setIsLoading(false);
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
                <h1 style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    fontWeight: 'bold'
                }}>
                    Bienvenue !
                </h1>
                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '2rem',
                    opacity: '0.9'
                }}>
                    CRÉEZ VOTRE COMPTE
                </h2>
                <p style={{
                    fontSize: '1rem',
                    opacity: '0.8',
                    maxWidth: '400px'
                }}>
                    Inscrivez-vous pour commencer à gérer vos appartements en toute simplicité.
                </p>
            </div>

            {/* Partie droite - Formulaire d'inscription */}
            <div style={{
                flex: '1',
                backgroundColor: 'white',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
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
                        Inscription
                    </h2>
                    <p style={{
                        color: '#666',
                        marginBottom: '2rem'
                    }}>
                        Remplissez le formulaire pour créer votre compte
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
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>

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
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
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
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#2c3e50'
                            }}>
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#00B894',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                marginBottom: '1rem'
                            }}
                        >
                            {isLoading ? 'Inscription en cours...' : "S'inscrire"}
                        </button>

                        <p style={{
                            textAlign: 'center',
                            color: '#666'
                        }}>
                            Déjà un compte ?{' '}
                            <a
                                href="/login"
                                style={{
                                    color: '#0061f2',
                                    textDecoration: 'none'
                                }}
                            >
                                Connectez-vous
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register; 