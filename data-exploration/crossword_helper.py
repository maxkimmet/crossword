import json


class Crossword:
    """Used to generate a crossword based on a config file and list of possible clues.

    Attributes:
        title (str): Title of the crossword.
        author (str): Author of the crossword.
        date (str): Date of the crossword.
        grid (list[str]): Representation of crossword grid where each string represents a row
            and each character represents a cell. The characters indicated the following:
            .       blank (to be generated)
            #       unused (blacked out)
            [a-z]   special (shaded or circled)
            [A-Z]   regular (known constraint)
        height (int): Height of the crossword based on the grid.
        width (int): Width of the crossword based on the grid.
        clues (dict[str, str]): Map of possible answers to their associated clue.
        entries (set[Entry]): Representations of the entries in the crossword.

    """

    def __init__(self, config_file, clues):
        """

        Args:
            config_file (str): Path to .json containing crossword metadata.
            clues (dict[str, str]): Map of possible answers to their associated clue.

        """
        # Import config file
        with open(config_file) as f:
            config = json.load(f)
        try:
            self.title = config['title']
            self.author = config['author']
            self.date = config['date']
            self.grid = config['grid']
            self.height = len(self.grid)
            self.width = len(self.grid[0])
        except KeyError:
            raise KeyError("config file must have title, author, date, and grid")

        # Import clues
        self.clues = clues

        # Initialize crossword entries
        self.entries = []
        clue_enum = 1
        for i in range(self.height):
            for j in range(self.width):
                cell_starts_clue = False

                # Check if cell starts across entry
                if self.grid[i][j] != '#' and (j == 0 or self.grid[i][j-1] == '#'):
                    length = 1
                    while j + length < self.width and self.grid[i][j + length] != '#':
                        length += 1
                    if length > 1:
                        self.entries.append(Entry(f"A{clue_enum}", (i, j), length))
                        cell_starts_clue = True

                # Check if cell starts down entry
                if self.grid[i][j] != '#' and (i == 0 or self.grid[i-1][j] == '#'):
                    length = 1
                    while i + length < self.height and self.grid[i + length][j] != '#':
                        length += 1
                    if length > 1:
                        self.entries.append(Entry(f"D{clue_enum}", (i, j), length))
                        cell_starts_clue = True

                if cell_starts_clue:
                    clue_enum += 1

        # Add overlaps to entries
        for entry1 in self.entries:
            for entry2 in self.entries:
                if entry1 != entry2:
                    entry1.update_overlap(entry2)

    # TODO: Format as wrapper for generate function
    def generate(self, out_file=""):
        # Generate crossword
        if not self._generate():
            Exception("Crossword could not be generated with word list")

        # Update clues for entries and fill in grid
        for entry in self.entries:
            entry.clue = self.clues[entry.word]
            for i in range(entry.length):
                row, col = entry.cells[i]
                self.grid[row][col] = entry.word[i]

        if out_file:
            self.export(out_file)

    def _generate(self, used_words=[], print_grid=True) -> bool:
        # TODO: Choose entries with least possible words
        #       Of those, choose entry with most intersections with remaining words
        entry = None
        for e in self.entries:
            if e.word == "":
                entry = e
                break
        if entry is None:
            return True

        # Update entry constraints based on current state of crossword
        entry.update_constraints()

        # TODO: Get list of possible words ranked best to worst
        word_list = [
            word for word in self.clues.keys()
            if len(word) == entry.length
            and word not in used_words
            and entry.fits_constraints(word)
        ]

        # Try generating puzzle with word assigned to entry
        for word in word_list:
            # Assign word to entry and remove from possible words
            entry.word = word
            used_words.append(word)

            # Generate and print grid if flag is set
            if print_grid:
                local_grid = [[x for x in row] for row in self.grid]
                for local_entry in [x for x in self.entries if x.word]:
                    for i in range(local_entry.length):
                        row, col = local_entry.cells[i]
                        local_grid[row][col] = local_entry.word[i]
                print("\n" + "\n".join(["".join(row) for row in local_grid]))

            # Generate rest of puzzle
            if (self._generate(used_words, print_grid)):  # Return true if word leads to solved puzzle
                return True
            else:
                entry.word = ""
                used_words = used_words[:-1]

        # Return False if no words fit entry based on current crossword configuration
        return False

    def export(self, out_file : str):
        output = {
            'title': self.title,
            'author': self.author,
            'date': self.date,
            'height': self.height,
            'width': self.width,
            'grid': self.grid,
            'entries': []
        }
        for entry in sorted(self.entries):
            output['entries'].append({
                'name': entry.name,
                'word': entry.word,
                'clue': entry.clue,
                'cells': entry.cells
            })

        with open(out_file, 'w') as f:
            json.dump(output, f)

    def __str__(self):
        output = "\n".join(["".join(row) for row in self.grid])
        output += "\n\n"
        output += "\n".join([str(entry) for entry in sorted(self.entries)])

        return output


class Entry:

    def __init__(self, name, start_cell, length):
        self.name = name
        self.start_cell = start_cell
        self.length = length
        self.orientation = name[0]
        self.enum = int(name[1:])
        self.word = ""
        self.clue = ""
        self.overlaps : dict[Entry, tuple[int, int]] = dict()  # {Entry: (id of self, id of other)}
        self.constraints : list[tuple[int, str]] = []
        self.cells = []
        for i in range(length):
            if self.orientation == 'A':
                self.cells.append((start_cell[0], start_cell[1] + i))
            else:
                self.cells.append((start_cell[0] + i, start_cell[1]))

    def update_overlap(self, other):
        if self.orientation == other.orientation:
            return
        for i in range(len(self.cells)):
            for j in range(len(other.cells)):
                if self.cells[i] == other.cells[j]:
                    self.overlaps[other] = (i, j)

    def update_constraints(self) -> None:
        # Generate constraints as list of tuples of (index, letter)
        self.constraints = []
        for other, indices in self.overlaps.items():
            if other.word:
                self.constraints.append((indices[0], other.word[indices[1]]))

    def fits_constraints(self, word : str) -> bool:
        for index, letter in self.constraints:
            if word[index] != letter:
                return False
        return True

    def __gt__(self, obj):
        return self.orientation > obj.orientation or \
            (self.orientation == obj.orientation and self.enum > obj.enum)

    def __str__(self):
        return self.name.ljust(4) \
            + str(self.start_cell).ljust(12) \
            + self.word.ljust(16) \
            + self.clue
