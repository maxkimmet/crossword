# %%
import numpy as np
import pandas as pd
import re

# %% Import and clean data
df_clues = pd.read_csv('data/clues.tsv', sep='\t')
df_clues.dropna(inplace=True)

df_clues.answer = df_clues.answer.apply(lambda x: x.upper().strip())
df_clues = df_clues[df_clues.answer.str.contains('^[A-Z]+$')]

df_clues.clue = df_clues.clue.apply(lambda x: x.strip())

# Standardize ellipses in clues
df_clues.clue = df_clues.clue.apply(
    lambda x: re.sub(r"( ?\.){3} ?", "...", x)
)

# Remove trailing period from clues
df_clues.clue = df_clues.clue.apply(
    lambda x: re.sub(r"(?<!\.)\.$", "", x)
)

# Standardize representations of blanked words
df_clues.clue = df_clues.clue.apply(
    lambda x: re.sub(r"(__+|--+)|((_+|-+)$)", "____", x)
)

# Delete empty clues
df_clues.clue.replace('', np.nan, inplace=True)
df_clues.dropna(inplace=True)

# %% Group clues and answers including count of repeats and export
df_sorted = df_clues.groupby(['clue', 'answer']) \
    .agg(clue_count=('year', 'count'), max_year=('year', 'max'))
df_sorted.to_csv('data/sorted_clues.csv')

# %%
