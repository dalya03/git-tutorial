import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const server = express();
const port = process.env.PORT || 8000;
server.use(express.static('public'));
server.use(express.json());

// In-memory storage for decks
const decks = {};

// Helper function to create a new deck
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ rank, suit });
        });
    });
    return deck;
}

// Endpoint: Create a new deck
server.post('/temp/deck', (req, res) => {
    const deckId = uuidv4();
    decks[deckId] = {
        cards: createDeck(),
        drawnCards: []
    };
    res.status(201).json({ deckId });
});

// Endpoint: Shuffle a deck
server.patch('/temp/deck/shuffle/:deck_id', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }

    // Shuffle the deck using Fisher-Yates algorithm
    for (let i = deck.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
    }

    res.status(200).json({ message: 'Deck shuffled successfully' });
});

// Endpoint: Get the entire deck
server.get('/temp/deck/:deck_id', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }

    res.status(200).json({ cards: deck.cards });
});

// Endpoint: Draw a random card
server.get('/temp/deck/:deck_id/card', (req, res) => {
    const { deck_id } = req.params;
    const deck = decks[deck_id];

    if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
    }

    if (deck.cards.length === 0) {
        return res.status(400).json({ error: 'No cards left in the deck' });
    }

    const card = deck.cards.pop();
    deck.drawnCards.push(card);

    res.status(200).json({ card });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
