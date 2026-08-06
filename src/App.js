import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

const tmdbBase = "https://api.themoviedb.org/3";
const apiBase = "http://localhost:4000/api";
const imageBase = "https://image.tmdb.org/t/p/w500";
const genres = [
  { id: 28, name: "Ação" },
  { id: 12, name: "Aventura" },
  { id: 27, name: "Terror" },
  { id: 35, name: "Comédia" },
  { id: 18, name: "Drama" },
  { id: 878, name: "Ficção" },
];
const genreRoutes = [
  ...genres,
  { id: "popular", name: "Populares" },
  { id: "top", name: "Melhores" },
  { id: "now_playing", name: "Em Cartaz" },
];

const Shell = styled.div`
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(184, 134, 11, 0.18), transparent 25%), #050505;
  color: #fff;
`;
const Topbar = styled.header`
  padding: 20px 28px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;
const Brand = styled.div`font-weight: 800; letter-spacing: 0.08em; color: #d4af37;`;
const Nav = styled.nav`display: flex; gap: 12px; flex-wrap: wrap;`;
const NavLink = styled(Link)`color: #fff; text-decoration: none; border: 1px solid rgba(212,175,55,.35); padding: 10px 14px; border-radius: 999px;`;
const Button = styled.button`border: 0; background: #d4af37; color: #0b0b0b; padding: 10px 14px; border-radius: 999px; font-weight: 700; cursor: pointer;`;
const Panel = styled.main`padding: 28px; max-width: 1280px; margin: 0 auto;`;
const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
  justify-content: center;
  max-width: 100%;
  margin: 0 auto;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.article`
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(212,175,55,.18);
  border-radius: 18px;
  overflow: hidden;
`;
const CardLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  display: block;
  height: 100%;
`;
const Synopsis = styled.p`
  color: #fff;
  min-height: 96px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
const Title = styled.h1`font-size: clamp(2rem, 3vw, 3.6rem); color: #d4af37; margin-bottom: 10px;`;
const Input = styled.input`width: 100%; padding: 14px 16px; border-radius: 14px; border: 1px solid rgba(212,175,55,.25); background: #111; color: #fff;`;
const Select = styled.select`width: 100%; padding: 14px 16px; border-radius: 14px; border: 1px solid rgba(212,175,55,.25); background: #111; color: #fff;`;
const CarouselWrap = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
`;
const CarouselTrack = styled.div`
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding-bottom: 12px;
  flex: 1;

  &::-webkit-scrollbar {
    display: none;
  }
`;
const CarouselButton = styled.button`
  border: 1px solid rgba(212,175,55,.35);
  background: rgba(17,17,17,.9);
  color: #d4af37;
  width: 44px;
  min-width: 44px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 20px;
`;
const CardActions = styled.div`
  padding: 0 14px 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
const SectionTitle = styled.h2`color: #d4af37; margin: 22px 0 12px;`;

function truncateOverview(text, maxWords = 28) {
  if (!text) return "Sinopse indisponível.";
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
}
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function useStoredUser() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("api-filmes-user") || "null"));
  useEffect(() => {
    if (user) localStorage.setItem("api-filmes-user", JSON.stringify(user));
    else localStorage.removeItem("api-filmes-user");
  }, [user]);
  return [user, setUser];
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    identifier: "",
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = mode === "login" ? `${apiBase}/auth/login` : `${apiBase}/auth/register`;
      const body = mode === "login"
        ? { identifier: form.identifier, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Erro ao autenticar");
        return;
      }

      onAuth(data);
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel>
      <Title>{mode === "login" ? "Entrar" : "Criar conta"}</Title>
      <p style={{ marginBottom: 18, color: "#ddd" }}>
        {mode === "login"
          ? "Use nome ou email com sua senha para acessar o catálogo."
          : "Crie sua conta com nome, email e senha para entrar no sistema."}
      </p>
      <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 460 }}>
        {mode === "login" ? (
          <Input placeholder="Nome ou email" value={form.identifier} onChange={handleChange("identifier")} />
        ) : (
          <>
            <Input placeholder="Nome" value={form.name} onChange={handleChange("name")} />
            <Input placeholder="Email" value={form.email} onChange={handleChange("email")} />
          </>
        )}
        <Input type="password" placeholder="Senha" value={form.password} onChange={handleChange("password")} />
        {error ? <p style={{ color: "#ffb8b8" }}>{error}</p> : null}
        <Button type="submit" disabled={loading}>{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}</Button>
        <button
          type="button"
          onClick={() => {
            setError("");
            setMode((prev) => (prev === "login" ? "register" : "login"));
          }}
          style={{ background: "transparent", color: "#d4af37", border: 0, textAlign: "left" }}
        >
          {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Fazer login"}
        </button>
      </form>
    </Panel>
  );
}

function Catalog({ user, onToggleFavorite, onToggleWatchLater }) {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [rating, setRating] = useState("");
  const [topRated, setTopRated] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const carouselRef = useRef(null);
  const recCarouselRef = useRef(null);
  const KEY = process.env.REACT_APP_KEY;

  useEffect(() => {
    const endpoints = [
      `${tmdbBase}/movie/popular?api_key=${KEY}&language=pt-BR&page=1`,
      `${tmdbBase}/movie/popular?api_key=${KEY}&language=pt-BR&page=2`,
      `${tmdbBase}/movie/top_rated?api_key=${KEY}&language=pt-BR&page=1`,
      `${tmdbBase}/movie/now_playing?api_key=${KEY}&language=pt-BR&page=1`,
      `${tmdbBase}/movie/upcoming?api_key=${KEY}&language=pt-BR&page=1`,
    ];

    Promise.all(endpoints.map((url) => fetch(url).then((r) => r.json()))).then((responses) => {
      const merged = responses
        .flatMap((response) => response.results || [])
        .filter((movie, index, array) => array.findIndex((item) => item.id === movie.id) === index);
      setMovies(merged);
      setTopRated((responses[2]?.results || []).slice(0, 10));
    });
  }, [KEY]);

  useEffect(() => {
    const likedGenres = new Set();
    (user?.favorites || []).forEach((movieId) => {
      const movie = movies.find((item) => item.id === movieId);
      (movie?.genre_ids || []).forEach((id) => likedGenres.add(id));
    });
    (user?.watchLater || []).forEach((movieId) => {
      const movie = movies.find((item) => item.id === movieId);
      (movie?.genre_ids || []).forEach((id) => likedGenres.add(id));
    });
    const ids = [...likedGenres];
    setRecommended(ids.length ? movies.filter((movie) => movie.genre_ids?.some((id) => ids.includes(id))).slice(0, 8) : movies.slice(0, 8));
  }, [movies, user]);

  const filtered = useMemo(
    () =>
      movies.filter(
        (movie) =>
          (!query || movie.title.toLowerCase().includes(query.toLowerCase())) &&
          (!genre || movie.genre_ids.includes(Number(genre))) &&
          (!year || movie.release_date?.startsWith(year)) &&
          (!rating || movie.vote_average >= Number(rating))
      ),
    [movies, query, genre, year, rating]
  );

  return (
    <Panel>
      <Title>Catálogo</Title>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}>
        <Input placeholder="Buscar filme pelo nome" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Todos os gêneros</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </Select>
        <Input placeholder="Ano" value={year} onChange={(e) => setYear(e.target.value)} />
        <Select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">Avaliação mínima</option>
          <option value="5">5+</option>
          <option value="6">6+</option>
          <option value="7">7+</option>
          <option value="8">8+</option>
        </Select>
        <Button onClick={() => { setQuery(""); setGenre(""); }}>Reativar busca</Button>
      </div>

      <SectionTitle>Recomendações Personalizadas</SectionTitle>
      <CarouselWrap>
        <CarouselButton
          type="button"
          onClick={() => recCarouselRef.current?.scrollBy({ left: -420, behavior: "smooth" })}
          aria-label="Anterior recomendações"
        >
          ‹
        </CarouselButton>
        <CarouselTrack ref={recCarouselRef}>
          {recommended.map((movie) => (
            <Card key={`rec-${movie.id}`} style={{ minWidth: 180, scrollSnapAlign: "start" }}>
              <CardLink to={`/movie/${movie.id}`}>
                <img src={`${imageBase}${movie.poster_path}`} alt={movie.title} style={{ width: "100%" }} />
                <div style={{ padding: 12, color: "#fff" }}>{movie.title}</div>
              </CardLink>
            </Card>
          ))}
        </CarouselTrack>
        <CarouselButton
          type="button"
          onClick={() => recCarouselRef.current?.scrollBy({ left: 420, behavior: "smooth" })}
          aria-label="Próximo recomendações"
        >
          ›
        </CarouselButton>
      </CarouselWrap>

      <SectionTitle>Melhor Avaliado</SectionTitle>
      <CarouselWrap>
        <CarouselButton
          type="button"
          onClick={() => carouselRef.current?.scrollBy({ left: -420, behavior: "smooth" })}
          aria-label="Anterior"
        >
          ‹
        </CarouselButton>
        <CarouselTrack ref={carouselRef}>
        {topRated.map((movie) => (
          <Card key={movie.id} style={{ minWidth: 180, scrollSnapAlign: "start" }}>
            <CardLink to={`/movie/${movie.id}`}>
              <img src={`${imageBase}${movie.poster_path}`} alt={movie.title} style={{ width: "100%" }} />
              <div style={{ padding: 12, color: "#fff" }}>{movie.title}</div>
            </CardLink>
          </Card>
        ))}
        </CarouselTrack>
        <CarouselButton
          type="button"
          onClick={() => carouselRef.current?.scrollBy({ left: 420, behavior: "smooth" })}
          aria-label="Próximo"
        >
          ›
        </CarouselButton>
      </CarouselWrap>

      <SectionTitle>Filmes</SectionTitle>
      <Grid>
        {filtered.map((movie) => (
          <Card key={movie.id}>
            <CardLink to={`/movie/${movie.id}`}>
              <img src={`${imageBase}${movie.poster_path}`} alt={movie.title} style={{ width: "100%" }} />
              <div style={{ padding: 14 }}>
                <h3 style={{ marginBottom: 8 }}>{movie.title}</h3>
                <Synopsis>{truncateOverview(movie.overview, 12)}</Synopsis>
              </div>
            </CardLink>
            <CardActions>
              <Button as={Link} to={`/movie/${movie.id}`}>Descrição</Button>
              <Button onClick={() => onToggleFavorite(movie)}>
                {user?.favorites?.includes(movie.id) ? "Remover" : "Favoritar"}
              </Button>
              <Button onClick={() => onToggleWatchLater(movie)}>
                {user?.watchLater?.includes(movie.id) ? "Tirar da lista" : "Assistir Depois"}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Grid>
    </Panel>
  );
}

function Favorites({ user, onShare, onToggleFavorite }) {
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const KEY = process.env.REACT_APP_KEY;

  useEffect(() => {
    if (!user) return;
    Promise.all(
      (user.favorites || []).map((id) =>
        fetch(`${tmdbBase}/movie/${id}?api_key=${KEY}&language=pt-BR`).then((r) => r.json())
      )
    ).then(setFavoriteMovies);
  }, [user, KEY]);

  return (
    <Panel>
      <Title>Favoritos</Title>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <p>Seus filmes salvos ficam aqui.</p>
        <Button onClick={() => onShare(favoriteMovies)}>Compartilhar</Button>
      </div>
      <Grid>
        {favoriteMovies.map((movie) => (
          <Card key={movie.id}>
            <img src={`${imageBase}${movie.poster_path}`} alt={movie.title} style={{ width: "100%" }} />
            <div style={{ padding: 14, color: "#fff" }}>
              <h3>{movie.title}</h3>
              <button
                onClick={() => onToggleFavorite(movie)}
                style={{
                  marginTop: 10,
                  background: "transparent",
                  border: "1px solid #d4af37",
                  color: "#fff",
                  padding: "10px 14px",
                  borderRadius: 999,
                }}
              >
                Remover
              </button>
            </div>
          </Card>
        ))}
      </Grid>
    </Panel>
  );
}

function WatchLater({ user, onToggleWatchLater }) {
  const [movies, setMovies] = useState([]);
  const KEY = process.env.REACT_APP_KEY;
  useEffect(() => {
    if (!user) return;
    Promise.all((user.watchLater || []).map((id) => fetch(`${tmdbBase}/movie/${id}?api_key=${KEY}&language=pt-BR`).then((r) => r.json()))).then(setMovies);
  }, [user, KEY]);
  return (
    <Panel>
      <Title>Assistir Mais Tarde</Title>
      <Grid>
        {movies.map((movie) => (
          <Card key={movie.id}>
            <CardLink to={`/movie/${movie.id}`}>
              <img src={`${imageBase}${movie.poster_path}`} alt={movie.title} style={{ width: "100%" }} />
              <div style={{ padding: 14, color: "#fff" }}>
                <h3>{movie.title}</h3>
              </div>
            </CardLink>
            <div style={{ padding: "0 14px 14px" }}>
              <button onClick={() => onToggleWatchLater(movie)} style={{ marginTop: 10, background: "transparent", border: "1px solid #d4af37", color: "#fff", padding: "10px 14px", borderRadius: 999 }}>Remover</button>
            </div>
          </Card>
        ))}
      </Grid>
    </Panel>
  );
}

function Profile({ user, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || "#d4af37");
  return (
    <Panel>
      <Title>Perfil de Usuário</Title>
      <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input value={avatarColor} onChange={(e) => setAvatarColor(e.target.value)} />
        <Button onClick={() => onSave({ name, email, avatarColor })}>Salvar</Button>
      </div>
    </Panel>
  );
}

function GenrePage({ user, onToggleFavorite, onToggleWatchLater }) {
  const { genreId } = useParams();
  const [movies, setMovies] = useState([]);
  const KEY = process.env.REACT_APP_KEY;
  useEffect(() => {
    const url = genreId === "popular"
      ? `${tmdbBase}/movie/popular?api_key=${KEY}&language=pt-BR`
      : genreId === "top"
        ? `${tmdbBase}/movie/top_rated?api_key=${KEY}&language=pt-BR`
        : genreId === "now_playing"
          ? `${tmdbBase}/movie/now_playing?api_key=${KEY}&language=pt-BR`
          : `${tmdbBase}/discover/movie?api_key=${KEY}&language=pt-BR&with_genres=${genreId}`;
    fetch(url).then((r) => r.json()).then((d) => setMovies(d.results || []));
  }, [genreId, KEY]);
  const title = genreRoutes.find((g) => String(g.id) === String(genreId))?.name || "Gênero";
  return (
    <Panel>
      <Title>{title}</Title>
      <Grid>
        {movies.map((movie) => (
          <Card key={movie.id}>
            <CardLink to={`/movie/${movie.id}`}>
              <img src={`${imageBase}${movie.poster_path}`} alt={movie.title} style={{ width: "100%" }} />
              <div style={{ padding: 14 }}>
                <h3>{movie.title}</h3>
                <Synopsis>{truncateOverview(movie.overview, 12)}</Synopsis>
              </div>
            </CardLink>
            <div style={{ padding: "0 14px 14px", display: "flex", gap: 10 }}>
              <Button onClick={() => onToggleFavorite(movie)}>Favoritar</Button>
              <Button onClick={() => onToggleWatchLater(movie)}>Depois</Button>
            </div>
          </Card>
        ))}
      </Grid>
    </Panel>
  );
}

function MovieDetails({ user, onToggleFavorite, onToggleWatchLater }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState({});
  const KEY = process.env.REACT_APP_KEY;
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${tmdbBase}/movie/${id}?api_key=${KEY}&language=pt-BR`).then((r) => r.json()).then(setMovie);
    fetch(`${apiBase}/movies/comments/${id}`).then((r) => r.json()).then(setComments);
  }, [id, KEY]);

  const addComment = async () => {
    if (!text.trim()) return;
    const res = await fetch(`${apiBase}/movies/comments/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: user?.name || "Visitante", text }),
    });
    const data = await res.json();
    setComments((prev) => [data, ...prev]);
    setText("");
  };
  const addReply = async (parentId) => {
    const value = replyText[parentId];
    if (!value?.trim()) return;
    const res = await fetch(`${apiBase}/movies/comments/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: user?.name || "Visitante", text: value, parentId }),
    });
    const data = await res.json();
    setComments((prev) => [data, ...prev]);
    setReplyText((prev) => ({ ...prev, [parentId]: "" }));
  };

  if (!movie) return <Panel>Carregando...</Panel>;

  return (
    <Panel>
      <Button as={Link} to="/">Voltar</Button>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, marginTop: 24 }}>
        <img src={`${imageBase}${movie.poster_path}`} alt={movie.title} style={{ width: "100%", borderRadius: 18 }} />
        <div>
          <Title>{movie.title}</Title>
          <p style={{ color: "#fff" }}>{movie.overview}</p>
          <p style={{ margin: "12px 0", color: "#d4af37" }}>Lançamento: {movie.release_date}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button onClick={() => onToggleFavorite(movie)}>
              {user?.favorites?.includes(movie.id) ? "Remover dos favoritos" : "Favoritar"}
            </Button>
            <Button
              onClick={async () => {
                const wasInList = user?.watchLater?.includes(movie.id);
                await onToggleWatchLater(movie);
                if (!wasInList) navigate("/watch-later");
              }}
            >
              {user?.watchLater?.includes(movie.id) ? "Tirar da lista" : "Assistir Mais Tarde"}
            </Button>
          </div>
          <div style={{ marginTop: 28 }}>
            <h2 style={{ color: "#d4af37", marginBottom: 12 }}>Comentários</h2>
            <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva um comentário" />
              <Button onClick={addComment}>Comentar</Button>
            </div>
            {Object.entries(groupBy(comments.filter((c) => !c.parentId), (c) => c._id)).map(([parentId, items]) => (
              <Card key={parentId} style={{ padding: 14, marginBottom: 10 }}>
                <strong style={{ color: "#d4af37" }}>{items[0].author}</strong>
                <p style={{ color: "#fff", marginTop: 6 }}>{items[0].text}</p>
                <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: "1px solid rgba(212,175,55,.25)" }}>
                  {(comments.filter((c) => c.parentId === parentId)).map((reply) => (
                    <div key={reply._id} style={{ marginBottom: 8 }}>
                      <strong style={{ color: "#d4af37" }}>{reply.author}</strong>
                      <p style={{ color: "#fff" }}>{reply.text}</p>
                    </div>
                  ))}
                  <Input
                    placeholder="Responder"
                    value={replyText[parentId] || ""}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [parentId]: e.target.value }))}
                  />
                  <Button onClick={() => addReply(parentId)} style={{ marginTop: 8 }}>Responder</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function AppContent() {
  const [user, setUser] = useStoredUser();

  const handleAuth = (data) => {
    setUser(data);
  };

  const syncFavorite = async (movie) => {
    if (!user) return;
    const has = (user.favorites || []).includes(movie.id);
    const res = await fetch(`${apiBase}/movies/favorites/${user.id}${has ? `/${movie.id}` : ""}`, {
      method: has ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: has ? undefined : JSON.stringify({ movieId: movie.id }),
    });
    const data = await res.json();
    setUser({ ...user, favorites: data.favorites });
  };
  const syncWatchLater = async (movie) => {
    if (!user) return;
    const has = (user.watchLater || []).includes(movie.id);
    const res = await fetch(`${apiBase}/movies/watch-later/${user.id}${has ? `/${movie.id}` : ""}`, {
      method: has ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: has ? undefined : JSON.stringify({ movieId: movie.id }),
    });
    const data = await res.json();
    setUser({ ...user, watchLater: data.watchLater });
  };
  const saveProfile = async (profile) => {
    const res = await fetch(`${apiBase}/movies/profile/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    setUser(data);
  };

  const shareFavorites = async (movies) => {
    const text = movies.map((m) => m.title).join(", ");
    await navigator.clipboard.writeText(text || "Sem favoritos");
    alert("Lista de favoritos copiada para a área de transferência.");
  };

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <Shell>
      <Topbar>
        <Brand>API FILMES</Brand>
        <Nav>
          <NavLink to="/">Catálogo</NavLink>
          <NavLink to="/favorites">Favoritos</NavLink>
          <NavLink to="/watch-later">Assistir Mais Tarde</NavLink>
          <NavLink to="/profile">Perfil</NavLink>
          {genreRoutes.map((g) => (
            <NavLink key={g.id} to={`/genre/${g.id}`}>{g.name}</NavLink>
          ))}
        </Nav>
        <Button onClick={() => setUser(null)}>Sair</Button>
      </Topbar>
      <Routes>
        <Route path="/" element={<Catalog user={user} onToggleFavorite={syncFavorite} onToggleWatchLater={syncWatchLater} />} />
        <Route path="/favorites" element={<Favorites user={user} onShare={shareFavorites} onToggleFavorite={syncFavorite} />} />
        <Route path="/watch-later" element={<WatchLater user={user} onToggleWatchLater={syncWatchLater} />} />
        <Route path="/profile" element={<Profile user={user} onSave={saveProfile} />} />
        <Route path="/genre/:genreId" element={<GenrePage user={user} onToggleFavorite={syncFavorite} onToggleWatchLater={syncWatchLater} />} />
        <Route path="/movie/:id" element={<MovieDetails user={user} onToggleFavorite={syncFavorite} onToggleWatchLater={syncWatchLater} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default AppContent;
