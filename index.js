const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require("cors");

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de gestion des dépenses de collocation',
            version: '1.0.0',
            description: 'Une API pour gérer les dépenses d\'une collocation'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Serveur de développement'
            }
        ]
    },
    apis: ['index.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const app = express();
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'framework',
    password: 'root',
    database: 'tricount'
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
    } else {
        console.log('Connexion réussie à la base de données');
    }
});

// #region Utilisateurs

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /utilisateurs:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       description: Objet représentant le nouvel utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Utilisateur'
 *     responses:
 *       '200':
 *         description: Succès - L'utilisateur a été créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utilisateur'
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la création de l'utilisateur
 */
app.post('/utilisateurs', (req, res) => {
    const nouvelUtilisateur = req.body;

    const sql = 'INSERT INTO utilisateurs (nom, email) VALUES (?, ?)';
    const values = [nouvelUtilisateur.nom, nouvelUtilisateur.email];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de l\'utilisateur :', err);
            res.sendStatus(500);
        } else {
            const utilisateurId = result.insertId;
            nouvelUtilisateur.id = utilisateurId;
            res.json(nouvelUtilisateur);
        }
    });
});

/**
 * @swagger
 * /utilisateurs:
 *   get:
 *     summary: Récupère tous les utilisateurs
 *     tags: [Utilisateurs]
 *     responses:
 *       '200':
 *         description: Succès - Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Utilisateur'
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la récupération des utilisateurs
 */
app.get('/utilisateurs', (req, res) => {
    const sql = 'SELECT * FROM utilisateurs';

    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des utilisateurs :', err);
            res.sendStatus(500);
        } else {
            res.json(rows);
        }
    });
});

/**
 * @swagger
 * /utilisateurs/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès - Utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utilisateur'
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la récupération de l'utilisateur
 */
app.get('/utilisateurs/:id', (req, res) => {
    const utilisateurId = req.params.id;

    const sql = 'SELECT * FROM utilisateurs WHERE id = ?';
    const values = [utilisateurId];

    connection.query(sql, values, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'utilisateur :', err);
            res.sendStatus(500);
        } else {
            if (rows.length === 0) {
                res.sendStatus(404);
            } else {
                res.json(rows[0]);
            }
        }
    });
});

/**
 * @swagger
 * /utilisateurs/{id}:
 *   put:
 *     summary: Met à jour un utilisateur par son ID
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à mettre à jour
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Objet représentant l'utilisateur modifié
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Utilisateur'
 *     responses:
 *       '200':
 *         description: Succès - Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Utilisateur'
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la mise à jour de l'utilisateur
 */
app.put('/utilisateurs/:id', (req, res) => {
    const utilisateurId = req.params.id;
    const utilisateurModifie = req.body;

    const sql = 'UPDATE utilisateurs SET nom = ?, email = ? WHERE id = ?';
    const values = [utilisateurModifie.nom, utilisateurModifie.email, utilisateurId];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur :', err);
            res.sendStatus(500);
        } else {
            res.json(utilisateurModifie);
        }
    });
});

/**
 * @swagger
 * /utilisateurs/{id}:
 *   delete:
 *     summary: Supprime un utilisateur par son ID
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à supprimer
 *         schema:
 *           type: integer
 *     responses:
 *       '204':
 *         description: Succès - Utilisateur supprimé avec succès
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la suppression de l'utilisateur
 */
app.delete('/utilisateurs/:id', (req, res) => {
    const utilisateurId = req.params.id;

    const sql = 'DELETE FROM utilisateurs WHERE id = ?';
    const values = [utilisateurId];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de l\'utilisateur :', err);
            res.sendStatus(500);
        } else {
            res.sendStatus(204);
        }
    });
});
// #endregion

// #region Dépenses

/**
 * @swagger
 * tags:
 *   name: Dépenses
 *   description: Gestion des dépenses
 */

/**
 * @swagger
 * /depenses:
 *   post:
 *     summary: Crée une nouvelle dépense
 *     tags: [Dépenses]
 *     requestBody:
 *       description: Objet représentant la nouvelle dépense
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Depense'
 *     responses:
 *       '200':
 *         description: Succès - La dépense a été créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Depense'
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la création de la dépense
 */
app.post('/depenses', (req, res) => {
    const nouvelleDepense = req.body;

    const sql = 'INSERT INTO depenses (montant, description, utilisateur_id, categorie_id, date_paiement) VALUES (?, ?, ?, ?, ?)';
    const values = [nouvelleDepense.montant, nouvelleDepense.description, nouvelleDepense.utilisateur_id, nouvelleDepense.categorie_id, nouvelleDepense.date_paiement];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la dépense :', err);
            res.sendStatus(500);
        } else {
            const depenseId = result.insertId;
            nouvelleDepense.id = depenseId;
            res.json(nouvelleDepense);
        }
    });
});

/**
* @swagger
* /depenses:
*   get:
*     summary: Récupère toutes les dépenses
*     tags: [Dépenses]
*     responses:
*       '200':
*         description: Succès - Liste des dépenses récupérée avec succès
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Depense'
*       '500':
*         description: Erreur - Une erreur est survenue lors de la récupération des dépenses
*/
app.get('/depenses', (req, res) => {
    const sql = 'SELECT * FROM depenses ORDER BY depenses.date_paiement DESC';

    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des dépenses :', err);
            res.sendStatus(500);
        } else {
            res.json(rows);
        }
    });
});

/**
 * @swagger
 * /depenses/{id}:
 *   get:
 *     summary: Récupère une dépense par son ID
 *     tags: [Dépenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la dépense à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès - Dépense récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Depense'
 *       '404':
 *         description: Dépense non trouvée
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la récupération de la dépense
 */
app.get('/depenses/:id', (req, res) => {
    const depenseId = req.params.id;

    const sql = 'SELECT * FROM depenses WHERE id = ?';
    const values = [depenseId];

    connection.query(sql, values, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération de la dépense :', err);
            res.sendStatus(500);
        } else {
            if (rows.length === 0) {
                res.sendStatus(404);
            } else {
                res.json(rows[0]);
            }
        }
    });
});

/**
 * @swagger
 * /depenses/{id}:
 *   put:
 *     summary: Met à jour une dépense par son ID
 *     tags: [Dépenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la dépense à mettre à jour
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Objet représentant la dépense mise à jour
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Depense'
 *     responses:
 *       '200':
 *         description: Succès - La dépense a été mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Depense'
 *       '404':
 *         description: Dépense non trouvée
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la mise à jour de la dépense
 */
app.put('/depenses/:id', (req, res) => {
    const depenseId = req.params.id;
    const depenseModifiee = req.body;

    const sql = 'UPDATE depenses SET montant = ?, description = ?, utilisateur_id = ?, categorie_id = ?, date_paiement = ? WHERE id = ?';
    const values = [depenseModifiee.montant, depenseModifiee.description, depenseModifiee.utilisateur_id, depenseModifiee.categorie_id, depenseModifiee.date_paiement, depenseId];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la dépense :', err);
            res.sendStatus(500);
        } else {
            if (result.affectedRows === 0) {
                res.sendStatus(404);
            } else {
                res.json(depenseModifiee);
            }
        }
    });
});

/**
 * @swagger
 * /depenses/{id}:
 *   delete:
 *     summary: Supprime une dépense par son ID
 *     tags: [Dépenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la dépense à supprimer
 *         schema:
 *           type: integer
 *     responses:
 *       '204':
 *         description: Succès - Dépense supprimée avec succès
 *       '404':
 *         description: Dépense non trouvée
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la suppression de la dépense
 */
app.delete('/depenses/:id', (req, res) => {
    const depenseId = req.params.id;

    const sql = 'DELETE FROM depenses WHERE id = ?';
    const values = [depenseId];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de la dépense :', err);
            res.sendStatus(500);
        } else {
            if (result.affectedRows === 0) {
                res.sendStatus(404);
            } else {
                res.sendStatus(204);
            }
        }
    });
});
//#endregion

// #region Catégories

/**
 * @swagger
 * tags:
 *   name: Catégories
 *   description: Gestion des catégories de dépenses
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crée une nouvelle catégorie de dépenses
 *     tags: [Catégories]
 *     requestBody:
 *       description: Objet représentant la nouvelle catégorie de dépenses
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categorie'
 *     responses:
 *       '200':
 *         description: Succès - La catégorie de dépenses a été créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categorie'
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la création de la catégorie de dépenses
 */
app.post('/categories', (req, res) => {
    const nouvelleCategorie = req.body;

    const sql = 'INSERT INTO categories (nom) VALUES (?)';
    const values = [nouvelleCategorie.nom];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la catégorie de dépenses :', err);
            res.sendStatus(500);
        } else {
            const categorieId = result.insertId;
            nouvelleCategorie.id = categorieId;
            res.json(nouvelleCategorie);
        }
    });
});

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Récupère toutes les catégories de dépenses
 *     tags: [Catégories]
 *     responses:
 *       '200':
 *         description: Succès - Liste des catégories de dépenses récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categorie'
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la récupération des catégories de dépenses
 */
app.get('/categories', (req, res) => {
    const sql = 'SELECT * FROM categories';

    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des catégories de dépenses :', err);
            res.sendStatus(500);
        } else {
            res.json(rows);
        }
    });
});

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Récupère une catégorie de dépenses par son ID
 *     tags: [Catégories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la catégorie de dépenses à récupérer
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Succès - Catégorie de dépenses récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categorie'
 *       '404':
 *         description: Catégorie de dépenses non trouvée
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la récupération de la catégorie de dépenses
 */
app.get('/categories/:id', (req, res) => {
    const categorieId = req.params.id;

    const sql = 'SELECT * FROM categories WHERE id = ?';
    const values = [categorieId];

    connection.query(sql, values, (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération de la catégorie de dépenses :', err);
            res.sendStatus(500);
        } else {
            if (rows.length === 0) {
                res.sendStatus(404);
            } else {
                res.json(rows[0]);
            }
        }
    });
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Met à jour une catégorie de dépenses par son ID
 *     tags: [Catégories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la catégorie de dépenses à mettre à jour
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Objet représentant la catégorie de dépenses mise à jour
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categorie'
 *     responses:
 *       '200':
 *         description: Succès - Catégorie de dépenses mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categorie'
 *       '404':
 *         description: Catégorie de dépenses non trouvée
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la mise à jour de la catégorie de dépenses
 */
app.put('/categories/:id', (req, res) => {
    const categorieId = req.params.id;
    const categorieModifiee = req.body;

    const sql = 'UPDATE categories SET nom = ? WHERE id = ?';
    const values = [categorieModifiee.nom, categorieId];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la catégorie de dépenses :', err);
            res.sendStatus(500);
        } else {
            if (result.affectedRows === 0) {
                res.sendStatus(404);
            } else {
                res.json(categorieModifiee);
            }
        }
    });
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Supprime une catégorie de dépenses par son ID
 *     tags: [Catégories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la catégorie de dépenses à supprimer
 *         schema:
 *           type: integer
 *     responses:
 *       '204':
 *         description: Succès - Catégorie de dépenses supprimée avec succès
 *       '404':
 *         description: Catégorie de dépenses non trouvée
 *       '500':
 *         description: Erreur - Une erreur est survenue lors de la suppression de la catégorie de dépenses
 */
app.delete('/categories/:id', (req, res) => {
    const categorieId = req.params.id;

    const sql = 'DELETE FROM categories WHERE id = ?';
    const values = [categorieId];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de la catégorie de dépenses :', err);
            res.sendStatus(500);
        } else {
            if (result.affectedRows === 0) {
                res.sendStatus(404);
            } else {
                res.sendStatus(204);
            }
        }
    });
});
//#endregion

// Démarrer le serveur
app.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});