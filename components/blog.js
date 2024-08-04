import { ContentLayout } from '/components/base.js';
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { ref, onMounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { fetchContent } from '/utils';

const parseMarkdown = (value) => marked.parse(value);

async function fetchBlogSitemap() {
    try {
        const response = await fetch('/sitemap.xml');
        const xmlText = await response.text();
        const blogEntries = xmlText.match(/<url>[\s\S]*?<\/url>/g)
        .filter(entry => entry.includes('/#/blog/'))
        .map(entry => ({
            url: entry.match(/<loc>(.*?)<\/loc>/)[1],
            date: entry.match(/<lastmod>(.*?)<\/lastmod>/)[1],
            title: entry.match(/<custom:title>(.*?)<\/custom:title>/)[1],
            image: entry.match(/<custom:image>(.*?)<\/custom:image>/)?.[1] || null
        }));
        return blogEntries;
    } catch (error) {
        console.error('Error fetching sitemap:', error);
        return [];
    }
}
const BlogNavigationFooter = {
    props: ['blogSitemap', 'currentId'],
    computed: {
        nextPost() {
            const currentIndex = this.currentId - 1;
            return currentIndex < this.blogSitemap.length - 1 ? this.blogSitemap[currentIndex + 1] : null;
        },
        prevPost() {
            const currentIndex = this.currentId - 1;
            return currentIndex > 0 ? this.blogSitemap[currentIndex - 1] : null;
        }
    },
    template: `
    <section v-if="blogSitemap" class="section has-background-grey-lighter">
        <div class="container">
            <nav class="level">
                <div class="level-left">
                    <div v-if="prevPost" class="level-item">
                        <a :href="prevPost.url" class="box p-0 is-flex is-align-items-center">
                            <figure class="image is-64x64 mr-3">
                                <img :src="prevPost.image" :alt="prevPost.title + ' thumbnail'">
                            </figure>
                            <div class="p-3">
                                <p class="heading has-text-grey">Prev:</p>
                                <p class="title is-6">{{ prevPost.title }}</p>
                            </div>
                        </a>
                    </div>
                </div>
                <div class="level-right">
                    <div v-if="nextPost" class="level-item">
                        <a :href="nextPost.url" class="box p-0 is-flex is-align-items-center">
                            <div class="p-3 has-text-right">
                                <p class="heading has-text-grey">Next:</p>
                                <p class="title is-6">{{ nextPost.title }}</p>
                            </div>
                            <figure class="image is-64x64 ml-3">
                                <img :src="nextPost.image" :alt="nextPost.title + ' thumbnail'">
                            </figure>
                        </a>
                    </div>
                </div>
            </nav>
        </div>
    </section>
    `
};

const BlogHeader = {
    props: ['content'],
    template: `
        <section v-if="content" class="hero is-medium is-info has-background-black">
            <div class="container pb-4 pt-4">
                <div class="columns">
                    <div class="column is-two-thirds v-centered">
                        <h1 class="title is-2">{{ content.blogTitle }}</h1>
                        <h2 class="subtitle">{{ content.blogSubtitle }}</h2>
                        <div class="column"><a href="www.linkedin.com/in/stevegnz" class="is-flex is-align-items-center">
                            <span class="icon">
                                <i class="fa fa-user" aria-hidden="true"></i>
                            </span>
                            Steve Green
                            </a>
                            <span class="has-text-grey-light is-size-6">{{ formatDate(content.blogDate) }}</span>
                        </div>
                    </div>
                    <div class="column">
                        <figure class="image">
                            <img :src="content.blogImage" :alt="content.blogTitle">
                        </figure>
                    </div>
                </div>
            </div>
        </section>
    `,
    methods: {
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        }
    }
};

const BlogListing = {
    setup() {
        const blogPosts = ref([]);

        onMounted(async () => {
            blogPosts.value = await fetchBlogSitemap();
        });

        return { blogPosts };
    },
    methods: {
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        }
    },
    template: `
        <section class="section">
            <div class="container">
                <div class="columns is-multiline">
                    <div v-for="post in blogPosts" :key="post.url" class="column is-one-third">
                        <div class="card">
                            <div class="card-image">
                                <figure class="image is-4by3">
                                    <img :src="post.image" :alt="post.title">
                                </figure>
                            </div>
                            <div class="card-content">
                                <p class="title is-4">{{ post.title }}</p>
                                <p class="subtitle is-6">{{ formatDate(post.date) }}</p>
                            </div>
                            <footer class="card-footer">
                                <a :href="post.url" class="card-footer-item">Read More</a>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `
};

const BlogPost = {
    components: {
        BlogHeader,
        ContentLayout,
        BlogNavigationFooter
    },
    setup() {
        const route = useRoute();
        const content = ref(null);
        const contentPath = ref(null);
        const blogSitemap = ref([]);
        const currentId = ref(null);

        watchEffect(async () => {
            const [contentData, sitemapData] = await Promise.all([
                fetchContent(`/content/yaml/blog/${route.params.id}.yml`),
                fetchBlogSitemap()
            ]);
            contentPath.value = `/content/yaml/blog/${route.params.id}.yml`;
            content.value = contentData;
            blogSitemap.value = sitemapData;
            currentId.value = route.params.id;
        });

        return { 
            content, 
            contentPath,
            blogSitemap,
            currentId
        };
    },
    template: `
        <div v-if="content">
          <BlogHeader :content="content" />
          <ContentLayout :contentPath="contentPath" />
          <BlogNavigationFooter :blogSitemap="blogSitemap" :currentId="currentId" />
        </div>
    `
};

export { BlogNavigationFooter, BlogHeader, BlogListing, BlogPost };