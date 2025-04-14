import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUserData(prev => ({
                ...prev,
                username: user.username,
                email: user.email
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (userData.newPassword !== userData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:8081/update-profile',
                {
                    username: userData.username,
                    email: userData.email,
                    newPassword: userData.newPassword,
                    currentPassword: userData.currentPassword
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess('Profil mis à jour avec succès');
            localStorage.setItem('user', JSON.stringify({
                ...JSON.parse(localStorage.getItem('user')),
                username: userData.username,
                email: userData.email
            }));

            setUserData(prev => ({
                ...prev,
                newPassword: '',
                confirmPassword: '',
                currentPassword: ''
            }));
        } catch (err) {
            setError(err.response?.data?.error || 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{
            padding: '2rem',
            minHeight: '100vh',
            backgroundColor: '#F0F2F5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            <div style={{
                maxWidth: '1000px',
                width: '100%',
                display: 'flex',
                gap: '2rem',
                margin: '2rem auto'
            }}>
                {/* Partie gauche - Photo de profil */}
                <div style={{
                    flex: '0 0 300px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '2rem',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    height: 'fit-content'
                }}>
                    <div style={{
                        width: '150px',
                        height: '150px',
                        margin: '0 auto 1rem',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}>
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="#0061f2">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    <h3 style={{
                        margin: '1rem 0',
                        color: '#2c3e50',
                        fontSize: '1.5rem'
                    }}>
                        {userData.username}
                    </h3>
                    <button
                        style={{
                            backgroundColor: '#0061f2',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Upload New Photo
                    </button>
                    <p style={{
                        color: '#666',
                        fontSize: '0.9rem',
                        marginTop: '1rem',
                        marginBottom: '2rem'
                    }}>
                        Membre depuis le 25 Septembre 2024
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 12h18M3 12l6-6m-6 6l6 6" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Retour à l'accueil
                        </button>

                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Se déconnecter
                        </button>
                    </div>
                </div>

                {/* Partie droite - Formulaire d'édition */}
                <div style={{
                    flex: '1',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '2rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        borderBottom: '1px solid #eee',
                        paddingBottom: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <h2 style={{
                            color: '#2c3e50',
                            marginBottom: '0.5rem',
                            fontSize: '1.5rem'
                        }}>
                            Edit Profile
                        </h2>
                        <p style={{
                            color: '#666',
                            fontSize: '0.9rem'
                        }}>
                            User Info
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            marginBottom: '1rem'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50'
                                }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={userData.username}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50'
                                }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50'
                                }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={userData.newPassword}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50'
                                }}>
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={userData.confirmPassword}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: '#2c3e50'
                            }}>
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={userData.currentPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '1rem'
                                }}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                            <h3 style={{
                                color: '#2c3e50',
                                marginBottom: '1rem',
                                fontSize: '1.2rem'
                            }}>
                                Social Profile
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1rem'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Facebook Username"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Twitter Username"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                backgroundColor: '#FF5722',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                marginTop: '2rem',
                                width: '100%'
                            }}
                        >
                            {isLoading ? 'Mise à jour...' : 'Update Info'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal de confirmation de déconnexion */}
            {showLogoutModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            color: '#2c3e50',
                            marginBottom: '1rem',
                            fontSize: '1.5rem'
                        }}>
                            Confirmer la déconnexion
                        </h2>
                        <p style={{
                            color: '#666',
                            marginBottom: '1.5rem'
                        }}>
                            Êtes-vous sûr de vouloir vous déconnecter ?
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1rem'
                        }}>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmLogout}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: '#FF7675',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile; 