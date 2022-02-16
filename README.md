# A crossword site for my crossword friends

This repository contains the code for a multiplayer crossword website and the algorithm used to generate the crosswords. A link to the website can be found in the project's **About** section on GitHub.

I started doing crosswords with a few of my friends near the beginning of the COVID-19 pandemic, but struggled to find a website that allowed all of us to play together. This website was designed with the following features in mind:

1. Mobile support
2. Multiplayer without sign-up
3. Multiplayer with unlimited players
4. American style, densely-packed 15x15 crosswords where all letters are part of both a horizontal and vertical clue

This project is also an excuse for me to learn modern frameworks. The website uses .NET Core and React while the crossword generator is written in Python.

## Features coming soon
- Algorithm
    - Difficulty adjustment
    - Custom crossword clues
    - Themed clues
- Multiplayer
    - Indication of other players' cursors
    - Indication of how many players are connected
    - Modal on hub connection to share crossword link

## Known bugs
- Mobile
    - Inputs are discarded on Android when typing quickly
    - Keyboard does not appear on load
- Multiplayer
    - Timers are inconsistent across users
    - Expired sessions do not indicate that the connection has failed
