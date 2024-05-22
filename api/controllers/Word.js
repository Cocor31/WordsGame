/***********************************/
/*** Import des module nécessaires */
const DB = require('../db.config')
const Word = DB.Word


/**********************************/
/*** Routage de la ressource Word */
exports.getAllWords = (req, res) => {
    Word.findAll()
        .then(words => res.json({ data: words }))
        .catch(err => res.status(500).json({ message: 'Database Error', error: err }))
}

exports.getWord = async (req, res) => {
    let pid = parseInt(req.params.id)

    try {
        // Récupération du mot et vérification
        let word = await Word.findOne({ where: { id: pid } })
        if (word === null) {
            return res.status(404).json({ message: 'This word does not exist !' })
        }

        return res.json({ data: word })
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err })
    }
}

exports.addWord = async (req, res) => {

    // Validation des données reçues
    if (!req.body.name) {
        return res.status(400).json({ message: 'Missing Data' })
    }

    try {
        // On enlève les majuscules
        req.body.name = req.body.name.trim().toLowerCase();

        // Vérification si le mot existe déjà
        const word = await Word.findOne({ where: { name: req.body.name }, raw: true })
        if (word !== null) {
            return res.status(409).json({ message: `This word already exists !` })
        }

        // S'il y a une valeur pour le mot on considère qu'il est évalué
        if (req.body.hasOwnProperty('value')) {
            req.body.isEvaluate = true
        }

        // Céation du mot
        let wordc = await Word.create(req.body)
        return res.status(201).json({ message: 'Word Created', data: wordc })

    } catch (err) {
        res.status(500).json({ message: 'Database Error', error: err })
    }
}

exports.getWordHit = async (req, res) => {

    function enleverAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Validation des données reçues
    if (!req.body.name) {
        return res.status(400).json({ message: 'Missing Data' })
    }
    // console.log('API DATA: ', req.body.name)
    // On enlève les majuscules et espace
    let pname = req.body.name.trim().toLowerCase();

    // On enlève les accents
    pname = enleverAccents(pname);

    // Vérifier s'il y a un seul mot
    const words = pname.split(/\s+/); // Séparer la chaîne en mots en utilisant les espaces comme délimiteur
    if (words.length > 1) {
        return res.status(403).json({ message: 'Word should contain only one word' });
    }

    try {
        // Récupération du mot et vérification
        let word = await Word.findOne({ where: { name: pname, isEvaluate: true } })

        // Si le mot n'est pas trouvé ou n'est pas évalué
        if (word === null) {
            // ajout du mot à évaluer s'il n'existe pas dans la bdd
            let existingWord = await Word.findOne({ where: { name: pname } })
            if (existingWord === null) {
                await Word.create({ name: pname })
            }

            return res.status(400).json({ message: 'Word Not Found' })
        }

        return res.json({ data: word.value })
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err })
    }
}

exports.updateWord = async (req, res) => {
    let pid = parseInt(req.params.id)

    try {
        // Recherche du mot et vérification
        let word = await Word.findOne({ where: { id: pid }, raw: true })
        if (word === null) {
            return res.status(404).json({ message: 'This word does not exist !' })
        }

        // récupération des données
        let wordp = {}
        if (req.body.value) {
            wordp = {
                value: req.body.value,
                isEvaluate: true
            }
        }

        if (req.body.name) {
            wordp.name = req.body.name.trim().toLowerCase();
        }

        if (req.body.hasOwnProperty('isEvaluate')) {
            if (req.body.isEvaluate === 'false' || req.body.isEvaluate === false) {
                wordp = {
                    value: null,
                    isEvaluate: false
                }
            }
        }

        // Mise à jour du mot
        await Word.update(wordp, { where: { id: pid } })
        return res.json({ message: 'Word Updated', data: { ...word, ...wordp } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Database Error', error: err })
    }
}

exports.deleteWord = async (req, res) => {
    try {
        let pid = parseInt(req.params.id)

        // Suppression
        let count = await Word.destroy({ where: { id: pid } })
        // Test si résultat
        if (count === 0) {
            return res.status(404).json({ message: `This word does not exist !` })
        }
        // Message confirmation Deletion
        return res.status(200).json({ message: `Word (id: ${pid} ) Successfully Deleted. ${count} row(s) deleted` })

    } catch (err) {
        return res.status(500).json({ message: `Database Error`, error: err })
    }
}