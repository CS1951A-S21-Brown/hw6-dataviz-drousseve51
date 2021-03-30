import itertools
import pandas as pd

def list_to_pairs(arr):
    return itertools.combinations(arr, 2)


def convert_actors_to_pairs(csv_path):

    df = pd.read_csv(csv_path)

    actor_lists = df['cast']
    genres = df['listed_in']
    titles = df['title']
    all_pairs = []


    for i in range(len(actor_lists)):
        actor_list = actor_lists[i]
        # print(actor_list)
        genre_list = genres[i]
        title = titles[i]
        if type(actor_list) == str:
            # print(actor_list)
            temp = actor_list.split(', ')
            # print(temp)

            pairs = list(list_to_pairs(temp))
            # print(pairs)
            if not pairs:
                continue

            all_pairs.append((pairs, genre_list, title))
    #
    # print(all_pairs)
    # print(len(all_pairs))

    df_temp = pd.DataFrame(all_pairs, columns=['pairs', 'genres', 'title'])

    df_temp = df_temp.explode('pairs')

    df_temp[['source', 'target']] = pd.DataFrame(df_temp['pairs'].tolist(), index=df_temp.index)
    df_temp = df_temp.drop(columns=['pairs'])
    print(df_temp)

    # df_temp['source_occur'] = df_temp.groupby('source')['source'].transform('size')

    source_counts = df_temp['source'].value_counts()
    target_counts = df_temp['target'].value_counts()
    target_vals = set(df_temp['target'])
    print('done getting counts')
    df_temp['occur'] = df_temp['source'].apply(lambda x: source_counts[x] + (target_counts[x] if (x in target_vals) else 0))
    # df_temp = df_temp.loc[(df_temp['occur'] > 150)]
    # df_temp['show_id'] = df['title']
    print(df_temp)
    print(df_temp.columns)
    # df_temp['genres_l'] = df_temp['genres'].apply(lambda x: x.split(', '))

    df_temp.to_csv('../data/netflix_pairs.csv')

    return all_pairs

def get_genre_counts(csv_path):
    df = pd.read_csv(csv_path)

    genres = df['listed_in']
    titles = df['title']

    df['genres'] = df['listed_in'].apply(lambda x: x.split(', '))

    df = df.explode('genres')['genres']
    arr = df.value_counts()
    indices = arr.index
    print(arr)

    df_temp = pd.DataFrame({'genre': indices, 'count': arr})
    df_temp.reset_index()
    df_temp.to_csv('../data/netflix_counts.csv')


def get_runtime_year(csv_path):

    df = pd.read_csv(csv_path)
    df['duration'] = df['duration'].apply(lambda x: x.split(' min')[0])

    df = df[df['type'] == 'Movie']
    df_temp = pd.DataFrame({'runtime': df['duration'], 'year': df['release_year']})



    df_temp = (df_temp.groupby(['year'])).agg({'runtime': lambda x: ','.join(x)})

    print(df_temp)

    df_temp = df_temp[30:]
    # print(len(df_temp))

    print(df_temp)

    df_temp.to_csv('../data/netflix_runtimes.csv')

def count_vals(df, col, name):
    return (df[col] == name).sum()

if __name__ == '__main__':
    get_runtime_year('../data/netflix.csv')

