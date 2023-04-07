Vue.component("modal", {
    template: "#modal-template"
});

var app = new Vue({
    el: "#app",

    data: {
        baseURL: "https://cs3103.cs.unb.ca:8027",
        authenticated: false,
        loggedIn: null,
        blogData: null, // ?? when do we populate it?
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
            // How much of the process does this really get done?
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

        // consider getting rid of this
        resetForm(){
            this.title = "";
            this.content = "";
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
            axios
            let requestJson = {'title': title, 'content': content}
            .post(this.baseURL + "/user/" + loggedIn + "/blogs/", requestJson)
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
        },
        
        removeBlog(blogId){
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
/*
    watch: {
        // probably aren't going to be doing anything with this one either.
    }
    */

    //mounted: {    /* for axios? */  }


});




/*  TODO:

        editBlog(){

        },

        addComment(){

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