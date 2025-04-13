import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

// Configuration CORS plus permissive pour le développement
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

// Middleware pour ajouter les headers CORS manuellement
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Configuration de la connexion MySQL
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "hotel"
};

let db;

// Création de la connexion avec gestion de la reconnexion
function handleDisconnect() {
    console.log('Tentative de connexion à MySQL...');
    
    db = mysql.createConnection(dbConfig);

    db.connect(err => {
    if (err) {
            console.error("❌ Erreur de connexion à MySQL:", err);
            console.error("Code:", err.code);
            console.error("Message:", err.message);
            setTimeout(handleDisconnect, 2000);
    } else {
        console.log("✅ Connexion réussie à MySQL !");
            
            // Créer la table users si elle n'existe pas
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            
            db.query(createUsersTable, (err) => {
                if (err) {
                    console.error("❌ Erreur lors de la création de la table users:", err);
                } else {
                    console.log("✅ Table users vérifiée/créée avec succès");
                }
            });

            // Tester la connexion
            db.query('SELECT 1', (err, result) => {
                if (err) {
                    console.error("❌ Erreur lors du test de connexion:", err);
                } else {
                    console.log("✅ Test de connexion réussi");
                }
            });
        }
    });

    db.on('error', function(err) {
        console.error('Erreur MySQL:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Connexion perdue, tentative de reconnexion...');
            handleDisconnect();
        } else {
            console.error('Erreur fatale MySQL:', err);
            throw err;
        }
    });
}

handleDisconnect();

// Middleware pour logger les requêtes
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.url}`);
    if (req.method !== 'GET') {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Middleware pour vérifier la connexion MySQL
app.use((req, res, next) => {
    if (!db || db.state === 'disconnected') {
        console.error('MySQL non connecté!');
        return res.status(500).json({ error: "Erreur de connexion à la base de données" });
    }
    next();
});

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Token manquant" });
    }

    jwt.verify(token, 'votre_secret_jwt', (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token invalide" });
        }
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    console.log('Récupération de tous les appartements...');
    const sql = "SELECT * FROM appartement";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erreur lors de la récupération des appartements:", err);
            return res.status(500).json({ error: "Erreur lors de la récupération des données" });
        }
        console.log(`${result.length} appartements trouvés`);
        return res.json(result);
    });
});

// Route pour obtenir les détails d'un appartement
app.get('/appartement/:numApp', (req, res) => {
    const numApp = req.params.numApp;
    console.log(`Recherche de l'appartement ${numApp}...`);
    
    if (!numApp || numApp.trim() === '') {
        console.error("Numéro d'appartement manquant");
        return res.status(400).json({ error: "Numéro d'appartement manquant" });
    }

    const sql = "SELECT * FROM appartement WHERE numApp = ?";
    db.query(sql, [numApp], (err, result) => {
        if (err) {
            console.error(`Erreur lors de la récupération de l'appartement ${numApp}:`, err);
            return res.status(500).json({ error: "Erreur lors de la récupération des données" });
        }
        if (!result || result.length === 0) {
            console.log(`Appartement ${numApp} non trouvé`);
            return res.status(404).json({ error: "Appartement non trouvé" });
        }
        console.log('Appartement trouvé:', result[0]);
        return res.json(result);
    });
});

app.post('/appartement', (req, res) => {
    console.log('Création d\'un nouvel appartement...');
    console.log('Données reçues:', req.body);
    
    if (!req.body.numApp || !req.body.design || !req.body.loyer) {
        console.error("Données manquantes");
        return res.status(400).json({ error: "Numéro d'appartement, design et loyer sont requis" });
    }

    // Vérifier que le numApp n'est pas vide
    const numApp = req.body.numApp.trim();
    if (numApp === '') {
        return res.status(400).json({ error: "Le numéro d'appartement ne peut pas être vide" });
    }

    // Vérifier que le loyer est un nombre positif
    const loyer = Number(req.body.loyer);
    if (isNaN(loyer) || loyer <= 0) {
        return res.status(400).json({ error: "Le loyer doit être un nombre positif" });
    }

    // Vérifier si le numéro d'appartement existe déjà
    db.query("SELECT * FROM appartement WHERE numApp = ?", [numApp], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la vérification du numéro d\'appartement:', err);
            return res.status(500).json({ error: "Erreur lors de la vérification du numéro d'appartement" });
        }

        if (rows.length > 0) {
            return res.status(400).json({ error: "Ce numéro d'appartement existe déjà" });
        }

        // Créer la table si elle n'existe pas
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS appartement (
                numApp VARCHAR(50) PRIMARY KEY,
                design VARCHAR(255) NOT NULL,
                loyer DECIMAL(10,2) NOT NULL
            )
        `;

        db.query(createTableSQL, (err) => {
            if (err) {
                console.error('Erreur lors de la création/vérification de la table:', err);
                return res.status(500).json({ error: "Erreur lors de la configuration de la base de données" });
            }

            // Insérer le nouvel appartement avec le numApp spécifié
            const insertSQL = "INSERT INTO appartement (numApp, design, loyer) VALUES (?, ?, ?)";
            const values = [numApp, req.body.design, loyer];

            db.query(insertSQL, values, (err, result) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion:', err);
                    return res.status(500).json({ error: err.message });
                }
                console.log('Insertion réussie:', result);
                return res.json({ 
                    message: "Création réussie",
                    appartement: {
                        numApp: numApp,
                        design: req.body.design,
                        loyer: loyer
                    }
                });
            });
        });
    });
});

// Route pour supprimer un appartement
app.delete('/delete/:numApp', (req, res) => {
    const numApp = req.params.numApp;
    console.log(`Tentative de suppression de l'appartement ${numApp}...`);
    
    if (!numApp || numApp.trim() === '') {
        console.error("Numéro d'appartement invalide:", req.params.numApp);
        return res.status(400).json({ error: "Numéro d'appartement invalide" });
    }

    // Vérifier d'abord si l'appartement existe
    db.query("SELECT * FROM appartement WHERE numApp = ?", [numApp], (err, rows) => {
        if (err) {
            console.error(`Erreur lors de la vérification de l'appartement ${numApp}:`, err);
            return res.status(500).json({ error: "Erreur lors de la vérification de l'appartement" });
        }

        if (rows.length === 0) {
            console.log(`Appartement ${numApp} non trouvé pour la suppression`);
            return res.status(404).json({ error: "Appartement non trouvé" });
        }

        console.log(`Suppression de l'appartement ${numApp}...`);
        const sql = "DELETE FROM appartement WHERE numApp = ?";
    db.query(sql, [numApp], (err, result) => {
            if (err) {
                console.error(`Erreur lors de la suppression de l'appartement ${numApp}:`, err);
                return res.status(500).json({ error: "Erreur lors de la suppression" });
            }

            console.log('Suppression réussie:', result);
            return res.json({ 
                message: "Suppression réussie",
                id: numApp
            });
        });
    });
});

// Route pour modifier un appartement
app.put('/update/:numApp', (req, res) => {
    const oldNumApp = req.params.numApp;
    const { numApp, design, loyer } = req.body;

    console.log('Tentative de modification:', {
        oldNumApp,
        newData: { numApp, design, loyer }
    });

    // Validation des données
    if (!numApp || !design || !loyer) {
        console.error("Données manquantes");
        return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    // Vérifier que le numApp n'est pas vide
    if (numApp.trim() === '') {
        return res.status(400).json({ error: "Le numéro d'appartement ne peut pas être vide" });
    }

    // Vérifier que le loyer est un nombre positif
    const loyerNum = Number(loyer);
    if (isNaN(loyerNum) || loyerNum <= 0) {
        return res.status(400).json({ error: "Le loyer doit être un nombre positif" });
    }

    // Vérifier si le nouvel numApp existe déjà (sauf si c'est le même)
    if (numApp !== oldNumApp) {
        db.query(
            "SELECT numApp FROM appartement WHERE numApp = ? AND numApp != ?",
            [numApp, oldNumApp],
            (err, rows) => {
                if (err) {
                    console.error("Erreur lors de la vérification du numéro d'appartement:", err);
                    return res.status(500).json({ error: "Erreur lors de la vérification du numéro d'appartement" });
                }

                if (rows.length > 0) {
                    return res.status(400).json({ error: "Ce numéro d'appartement existe déjà" });
                }

                // Procéder à la mise à jour si le numéro n'existe pas
                updateAppartement();
            }
        );
    } else {
        // Procéder directement à la mise à jour si le numéro n'a pas changé
        updateAppartement();
    }

    function updateAppartement() {
        const sql = "UPDATE appartement SET numApp = ?, design = ?, loyer = ? WHERE numApp = ?";
        const values = [numApp, design, loyerNum, oldNumApp];

    db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Erreur lors de la modification:", err);
                return res.status(500).json({ error: "Erreur lors de la modification" });
            }

            if (result.affectedRows === 0) {
                console.error("Appartement non trouvé:", oldNumApp);
                return res.status(404).json({ error: "Appartement non trouvé" });
            }

            console.log("Modification réussie:", result);
            res.json({ 
                message: "Modification réussie",
                data: { numApp, design, loyer: loyerNum }
            });
        });
    }
});

// Route pour l'inscription
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    // Validation des données
    if (!username || !password || !email) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        db.query('SELECT * FROM users WHERE username = ? OR email = ?', 
            [username, email], 
            async (err, results) => {
                if (err) {
                    console.error('Erreur lors de la vérification:', err);
                    return res.status(500).json({ error: "Erreur serveur" });
                }

                if (results.length > 0) {
                    return res.status(400).json({ error: "Nom d'utilisateur ou email déjà utilisé" });
                }

                // Hasher le mot de passe
                const hashedPassword = await bcrypt.hash(password, 10);

                // Créer l'utilisateur
                db.query(
                    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                    [username, hashedPassword, email],
                    (err, result) => {
                        if (err) {
                            console.error('Erreur lors de la création:', err);
                            return res.status(500).json({ error: "Erreur serveur" });
                        }

                        res.status(201).json({ message: "Utilisateur créé avec succès" });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour la connexion
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis" });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Erreur lors de la recherche:', err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
        }

        const user = results[0];

        try {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
            }

            // Créer le token JWT
            const token = jwt.sign(
                { id: user.id, username: user.username },
                'votre_secret_jwt',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    });
});

// Route pour mettre à jour le profil utilisateur
app.put('/update-profile', authenticateToken, async (req, res) => {
    const { username, newPassword, currentPassword } = req.body;
    const userId = req.user.id;

    try {
        // Vérifier si l'utilisateur existe
        db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
            if (err) {
                console.error('Erreur lors de la recherche de l\'utilisateur:', err);
                return res.status(500).json({ error: "Erreur serveur" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }

            const user = results[0];

            // Vérifier le mot de passe actuel
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: "Mot de passe actuel incorrect" });
            }

            // Vérifier si le nouveau nom d'utilisateur est déjà pris
            if (username !== user.username) {
                db.query('SELECT * FROM users WHERE username = ? AND id != ?', 
                    [username, userId], 
                    (err, results) => {
                        if (err) {
                            console.error('Erreur lors de la vérification du nom d\'utilisateur:', err);
                            return res.status(500).json({ error: "Erreur serveur" });
                        }

                        if (results.length > 0) {
                            return res.status(400).json({ error: "Ce nom d'utilisateur est déjà pris" });
                        }

                        // Procéder à la mise à jour
                        updateProfile(username, newPassword, user);
                    }
                );
            } else {
                // Procéder à la mise à jour
                updateProfile(username, newPassword, user);
            }
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: "Erreur serveur" });
    }

    async function updateProfile(username, newPassword, user) {
        try {
            let updates = [];
            let values = [];
            let query = 'UPDATE users SET';

            // Ajouter le nom d'utilisateur s'il a changé
            if (username !== user.username) {
                updates.push(' username = ?');
                values.push(username);
            }

            // Ajouter le nouveau mot de passe s'il est fourni
            if (newPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                updates.push(' password = ?');
                values.push(hashedPassword);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: "Aucune modification à effectuer" });
            }

            query += updates.join(',') + ' WHERE id = ?';
            values.push(user.id);

            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Erreur lors de la mise à jour:', err);
                    return res.status(500).json({ error: "Erreur lors de la mise à jour" });
                }

                res.json({ 
                    message: "Profil mis à jour avec succès",
                    user: {
                        id: user.id,
                        username: username,
                        email: user.email
                    }
                });
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }
});

// Protéger les routes avec le middleware d'authentification
app.use('/appartement', authenticateToken);
app.use('/update', authenticateToken);
app.use('/delete', authenticateToken);

// Lancement du serveur
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`\n✅ Serveur démarré sur le port ${PORT} 🎧`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});
