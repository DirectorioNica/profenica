const app = Vue.createApp({
    data() {
        return {
            posts: [],
            isLoading: false,
            currentPage: 0,
            postsPerPage: 10,
            currentCategory: null,
            maxPostsInDOM: 30,
            user: null // Verifica si hay un usuario autenticado
        };
    },
    methods: {
        async fetchPosts(page = 0, limit = 10, category = null) {
            const Post = Parse.Object.extend("Post");
            const query = new Parse.Query(Post);

            query.descending("createdAt");
            query.limit(limit);
            query.skip(page * limit);
            query.include("author");

            if (category) {
                query.equalTo("category", category);
            }

            try {
                const results = await query.find();
                return results.map(post => ({
                    id: post.id,
                    content: post.get("content"),
                    link: post.get("link"),
                    category: post.get("category"),
                    createdAt: new Date(post.createdAt).toLocaleString(),
                    author: post.get("author") ? post.get("author").get("username") : "Autor desconocido",
                    image: post.get("image") || null
                }));
            } catch (error) {
                console.error("Error al cargar los posts:", error);
                return [];
            }
        },

        async loadMorePosts(category = null) {
            if (this.isLoading) return;

            if (category !== this.currentCategory) {
                this.currentPage = 0;
                this.currentCategory = category;
                this.posts = [];
            }

            this.isLoading = true;
            const newPosts = await this.fetchPosts(this.currentPage, this.postsPerPage, category);
            this.posts = [...newPosts];

            this.currentPage++;
            this.isLoading = false;
        },

        async loadCategory(category) {
            console.log(`Cargando posts para la categoría: ${category}`);
            this.currentCategory = category;
            this.posts = await this.fetchPosts(0, this.postsPerPage, category);
            console.log("Posts cargados:", this.posts);
        },

        async checkUser() {
            this.user = Parse.User.current(); // Verificar usuario autenticado
        },

        handleScroll() {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !this.isLoading) {
                this.loadMorePosts(this.currentCategory);
            }
        }
    },

    mounted() {
        this.checkUser(); // Verificar usuario
        this.loadMorePosts(); // Cargar posts iniciales
        window.addEventListener("scroll", this.handleScroll);
    },

    beforeUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }
});

app.mount("#app");
