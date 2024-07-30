import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { ref, watchEffect, onMounted } from 'vue';
import { useRoute } from 'vue-router';
const parseMarkdown = (value) => marked.parse(value);

const NavBar = {
    props: ['logo', 'menuItems'],
    setup(props) {
        const route = useRoute();
        return { route };
    },
    methods: {
        scrollTo(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        handleNavigation(item) {
            if (item.url && item.url.startsWith('/#/') && this.route.path === '/') {
                // If it's a hash link and we're on the home page, use scrollTo
                const elementId = item.url.split('#')[2];
                this.scrollTo(elementId);
            } else {
                // Otherwise, navigate to the URL
                this.$router.push(item.url);
            }
        }
    },
    template: `
        <nav class="navbar is-fixed-top is-info has-background-black">
            <div class="container">
                <div class="navbar-brand">
                    <a class="navbar-item" href="/">
                        <img :src="logo" alt="Logo">
                    </a>
                </div>
                <div class="navbar-menu">
                    <div class="navbar-end">
                        <a v-for="item in menuItems" :key="item.url" class="navbar-item" @click="handleNavigation(item)">
                            {{ item.text }}
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    `
};

const HeroSection = {
    props: ['sectionData'],
    methods: {
        scrollTo(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    },
    template: `
            <section class="hero is-medium is-info " :class="sectionData.background" id="Hero">
                <div class="container">
                    <div class="hero-body"  :class="sectionData.background">
                        <div class="columns">
                            <div class="column">
                                <div>
                                    <img src="/content/WhiteLogo-BrandName-OnTransparent.png" alt="Practical:AI Logo">
                                </div>
                                <h1 class="title">{{ sectionData.title }}</h1>
                                <h2 class="subtitle">{{ sectionData.subtitle }}</h2>
                                <a @click="scrollTo(sectionData.ctaLink)" class="button custom-button2 is-primary is-large has-background-white">{{ sectionData.ctaText }}</a>
                            </div>
                            <div class="column is-one-third">
                                <figure class="image">
                                    <img class="is-rounded" src="/content/asarole.png" alt="AI Roles" />
                                </figure>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
    `
};

const ContentSection = {
    props: ['sectionData'],
    template: `
            <section class="section" :id="sectionData.title">
                <div class="container" v-if="!sectionData.staticHTML">
                    <h2 class="title is-2">{{ sectionData.title }}</h2>
                    <div class="content" v-html="parseMarkdown(sectionData.content)"></div>
                </div>
                <div class="container" v-else>
                    <h2 class="title is-2">{{ sectionData.title }}</h2>
                    <div :class="['columns ', sectionData.columnsClass]">
                        <div :class="['column', sectionData.columnClass]">
                            <div class="content" v-html="parseMarkdown(sectionData.content)"></div>
                        </div>
                        <div class="column" v-html="sectionData.staticHTML"></div>
                    </div>
                </div>
            </section>
    `,
    methods: { parseMarkdown }
};

const CardSection = {
    props: ['sectionData', 'workshops'],
    data() {
        return {
            activeModal: null,
        }
    },
    template: `
        <section class="section" :id="sectionData.title">
            <div class="container">
                <h2 class="title is-2">{{ sectionData.title }}</h2>
                <div class="columns is-multiline">
                    <div v-for="(item, index) in sectionData.items" :key="index" class="column" :class="sectionData.columnClass">
                        <div class="card">
                            <div class="card-content">
                                <div class="media">
                                    <div class="media-left" v-if="item.image || item.icon">
                                        <figure class="image is-64x64" v-if="item.image">
                                            <img class="is-rounded" :src="item.image" :alt="item.title">
                                        </figure>
                                        <span class="icon is-large" v-else-if="item.icon">
                                            <i :class="item.icon"></i>
                                        </span>
                                    </div>
                                    <div class="media-content">
                                        <p class="title is-4">{{ item.title }}</p>
                                        <p class="subtitle" v-if="item.subtitle">{{ item.subtitle }}</p>
                                    </div>
                                </div>
                                <div class="content" v-if="item.content" v-html="parseMarkdown(item.content)"></div>
                                <div v-if="item.buttonText" class="mt-5">
                                    <a 
                                        :href="item.buttonLink" 
                                        @click.prevent="!item.buttonLink && openModal(index)"
                                        class="button is-primary custom-button is-large is-black"
                                    >
                                        {{ item.buttonText }}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Bulma Modal -->
                        <div class="modal" :class="{ 'is-active': activeModal === index }">
                            <div class="modal-background" @click="closeModal"></div>
                            <div class="modal-card">
                                <header class="modal-card-head">
                                    <p class="modal-card-title">Select an event date for {{ item.title }}</p>
                                    <button class="delete" aria-label="close" @click="closeModal"></button>
                                </header>
                                <section class="modal-card-body">
                                        <div class="buttons">
                                            <button 
                                                v-for="workshop in filteredWorkshops(item)"
                                                :key="workshop.eventCode"
                                                @click="navigateToBooking(workshop.eventCode)"
                                                class="button is-fullwidth is-light">
                                                {{ formatDate(workshop.date) }} - {{ workshop.location }}
                                            </button>
                                        </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,
    methods: {
        parseMarkdown, 
        openModal(index) {
            this.activeModal = index;
        },
        closeModal() {
            this.activeModal = null;
        },
        filteredWorkshops(item) {
            return this.workshops.filter(event => event.title === item.title);
        },
        navigateToBooking(eventCode) {
            // Ensure the modal is closed before navigation
            this.closeModal();
            this.$router.push({ path: `/booking/${eventCode}` });
        },        
        formatDate(dateString) {
            // Parse the ISO date string manually
            const year = dateString.substr(0, 4);
            const month = dateString.substr(4, 2);
            const day = dateString.substr(6, 2);
            const hour = dateString.substr(9, 2);
            const minute = dateString.substr(11, 2);
            const second = dateString.substr(13, 2);

            // Create a new Date object
            const date = new Date(year, month - 1, day, hour, minute, second);

            // Format the date
            return date.toLocaleDateString('en-NZ', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        }
    }
};


const ContactForm = {
    props: ['sectionData'],
    template: `
        <section class="section" id="Contact">
            <div class="container">
                <h2 class="title is-2">Contact Us</h2>
                <div id="hubspot-form-container"></div>
            </div>
        </section>
    `,
    mounted() {
        this.loadHubspotForm();
    },
    methods: {
        loadHubspotForm() {
            const script = document.createElement('script');
            script.charset = 'utf-8';
            script.type = 'text/javascript';
            script.src = '//js.hsforms.net/forms/embed/v2.js';
            script.addEventListener('load', () => {
                hbspt.forms.create({
                    region: "na1",
                    portalId: "45154194",
                    formId: "5687d1d3-54b0-48a9-8207-0478b326920f",
                    target: "#hubspot-form-container"
                });
            });
            document.head.appendChild(script);
        }
    }
};

const SiteFooter = {
    props: ['footerData'],
    template: `
        <footer class="footer" v-if="footerData">
            <div class="content has-text-centered">
                <p>{{ footerData.generated }}</p>
                <p>{{ footerData.copyright }}</p>
                <div class="buttons is-centered">
                    <a v-for="(link, index) in footerData.socialLinks" :key="index" :href="link.url" class="button is-light">
                        <span class="icon"><i :class="link.icon"></i></span>
                    </a>
                </div>
            </div>
        </footer>
    `
};


const BookwhenIframe = {
    props: ['sectionData'],
    setup(props) {
        const route = useRoute();
        const eventCode = ref(route.params.eventCode);
        const iframeHeight = ref('820px');

        const setIframeSrc = () => {

            const iframe = document.getElementById('bookwhen-iframe');
            if (iframe && eventCode.value) {
                iframe.src = props.sectionData.url + eventCode.value;
            }
        };

        const handleMessage = (event) => {
            if (event.origin !== 'https://bookwhen.com') return;
            try {
                iframeHeight.value = event.data.height + 'px';
            } catch (e) {
                console.error('Error parsing message from Bookwhen:', e);
            }
        };

        onMounted(() => {
            setIframeSrc();
            window.addEventListener('message', handleMessage);
        });

        watchEffect(() => {
            setIframeSrc();
        });

        return {
            iframeHeight
        };
    },
    template: `
        <section class="section pt-2" v-if="sectionData">
            <div class="container">
                <iframe 
                    id="bookwhen-iframe" 
                    frameborder="0" 
                    scrolling="no" 
                    seamless="seamless" 
                    :style="{ display: 'block', border: 'none', width: '100%', height: iframeHeight }"
                ></iframe>
            </div>
        </section>
    `
};


const ContentLayout = {
    components: { NavBar, HeroSection, ContentSection, CardSection, ContactForm, SiteFooter, BookwhenIframe },
    props: ['contentFile','eventCode'],
    setup(props) {
        const content = ref(null);
        const headerFooter = ref(null);
        const workshops = ref(null);

        watchEffect(async () => {
            try {
                const [contentResponse, headerFooterResponse, workshopResponse] = await Promise.all([
                    fetch(props.contentFile),
                    fetch('/content/yaml/headerFooter.yml'),
                    fetch('/content/yaml/workshops.yml')
                ]);

                const [yamlContent, headerFooterContent, yamlWorkshops] = await Promise.all([
                    contentResponse.text(),
                    headerFooterResponse.text(),
                    workshopResponse.text()
                ]);

                content.value = jsyaml.load(yamlContent);
                headerFooter.value = jsyaml.load(headerFooterContent);
                workshops.value = jsyaml.load(yamlWorkshops);
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        });

        return { content, workshops, headerFooter };
    },
    template: `
        <nav-bar v-if="headerFooter" :logo="headerFooter.logo" :menu-items="headerFooter.menuItems"></nav-bar>
        <div v-if="content">
            <template v-for="(section, index) in content.sections" :key="index">
                <component :is="section.type" :section-data="section" :workshops="workshops.workshops"></component>
            </template>
        </div>
        <div v-else class="has-text-centered">
            <p>Loading...</p>
        </div>
        <site-footer v-if="headerFooter" :footerData="headerFooter.footer"></site-footer>
    `
};

export { ContentLayout, NavBar, HeroSection, ContentSection, CardSection, ContactForm, SiteFooter, BookwhenIframe };
