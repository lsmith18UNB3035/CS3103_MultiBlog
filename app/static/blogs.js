Vue.component("modal", {
    template: "#modal-template"
});

var app = new Vue({
    el: "#app",

    data: {
        baseURL: "https://cs3103.cs.unb.ca:8027",
        authenticated: false,
        loggedIn: null,
        blogData: null,
        editModal: false,
        isolateModal: false,

        input: {
            username: "",
            password: ""      
        },

        // worth adding?
        // blogList : {

        displayedBlog: {
            blogId: -1,
            userId: -1,
            author: "",
            title: "",
            content: "",
        },
        // },

        displayedComment: {
            commentId: -1,
            blogId: -1,
            userId: -1,
            author: "",
            content: "",
        },

        bannerContent: {
            noCredentials: "",
            badLogin: "",
            blogNotFound: "",
        },
    },

    mounted: function() {
        axios
        .get(this.baseURL+"/user/login")
        .then(response => {
          if (response.data.status == "success") {
            this.authenticated = true;
            this.loggedIn = response.data.user_id;
            this.getBlogs();
          }
        })
        .catch(error => {
            this.authenticated = false;
            console.log(error);
        });
    },


    //todo: check all the catch the bannerContent
    methods: {
        login() {
            this.bannerContent.badLogin = "";
            this.bannerContent.noCredentials = "";
            if(this.input.username != "" && this.input.password != "") {
                axios
                .post(this.baseURL + "/user/login", {
                    "username": this.input.username,
                    "password": this.input.password
                })
                .then(response => {
                        if (response.data.status == "success") {
                            this.authenticated = true;
                            this.loggedIn = response.data.userId;
                            this.getBlogs();
                        }
                })
                .catch(e => {
                    this.bannerContent.badLogin = "Incorrect username or password, please try again";
                    this.input.password = "";
                    console.log(e);
                });
            } else {
                this.bannerContent.noCredentials = "You must provide both a user name and password to enter";
            }        
        },

        logout(){
            axios.get(this.baseURL + "/user/logout")
            .then( response => {
                this.authenticated = false;
                this.loggedIn = null;
                location.reload();
            })
            .catch( e => {
                console.log(e);
            });
        },

        resetBlogData(){
            this.blogData = null;
            this.displayedBlog.blogId = -1;
            this.displayedBlog.userId = -1;
            this.displayedBlog.title = "";
            this.displayedBlog.content = "";
            this.displayedBlog.author = "";
        },

        resetCommentData(){
            this.displayedComment.blogId = -1;
            this.displayedComment.userId = -1;
            this.displayedComment.commentId = "";
            this.displayedComment.content = "";
            this.displayedComment.author = "";
        },

        getBlogs(){
            axios
            .get(this.baseURL + "/blogs")
            .then( response => {
                this.blogData = response.data.blogs;
            })
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
        },

        getBlogsByUser(userId){
            axios
            .get(this.baseURL + "/user/" + userId + "/blogs/")
            .then( response => {
                this.blogData = response.data.blogs;
            })
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
        },

        displayBlog(blogId){    // (fr. selectSchool(schoolId)  )
            this.showBlogModal();
            for (item in this.blogData) {
                if (this.blogData[item].blogId == blogId) {
                    this.displayedBlog = this.blogData[item]
                }
            }
        },

        addBlog(title, content){
            this.resetBlogData();
            axios
            let requestJson = {'title': title, 'content': content}
            .post(this.baseURL + "/user/" + loggedIn + "/blogs/", requestJson)
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
        },
        
        removeBlog(blogId){
            this.resetCommentData();
            axios
            .delete(this.baseURL + "/user/" + loggedIn + "/blogs/" + blogId)
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
        },

        removeComment(blogId, commentId){
            axios
            .delete(this.baseURL + "/user/" + loggedIn + "/blogs/" + blogId, + "/comments/" + commentId)
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
        },



        showBlogModal() {
            this.isolateModal = true;
        },
        hideBlogModal() {
            this.isolateModal = false;
        },
    },// --- methods --- //

    
    computed: {
        
    },
});




/*  TODO:

        editBlog(){

        },

        removeComment(){

        },

        editComment(){

        },

        getBlogs(){

        },

        getCommentsByBlog(){

        },
*/