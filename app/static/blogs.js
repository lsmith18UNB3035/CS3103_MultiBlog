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
        userBlogData: null,
        editModal: false,
        isolateModal: false,
        homeModal:false,
        writeModal: false,
        authorizedBlog: false,

        input: {
            username: "",
            password: ""      
        },

        newBlog:{
            title: "",
            content: ""
        },

        // worth adding?
        // blogList : {

        selectedBlog: { //this is basically the edited blog
            title: "",
            content: ""
        }, 

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
            this.loggedIn = response.data.userId;
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
                this.bannerContent.badLogin = "You must provide both a user name and password to enter";
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

        getBlogsByUser(){
            axios
            .get(this.baseURL + "/user/" + this.loggedIn + "/blogs")
            .then( response => {
                this.userBlogData = response.data.blogs;
            })
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
            this.showHomeModal();
        },

        displayBlog(blogId){    // (fr. selectSchool(schoolId)  )
            this.showBlogModal();
            for (item in this.blogData) {
                if (this.blogData[item].blogId == blogId) {
                    this.displayedBlog = this.blogData[item]
                    if(this.blogData[item].userId == this.loggedIn){
                        this.authorizedBlog = true;
                    }
                }
            }
        },

        addBlog(){
            let requestJson = null;
            requestJson = {'title': this.newBlog.title, 'content': this.newBlog.content}
            axios
            /*
            .post(this.baseURL + "/user/" + this.loggedIn + "/blogs", {
                "title": this.input.username,
                "password": this.input.password
            })
            */
            .post(this.baseURL + "/user/" + this.loggedIn + "/blogs", requestJson)
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
            this.hideWriteModal();
        },

        submitBlogEdit() {
            let requestJson = null;
            requestJson = {'title': this.selectedBlog.title, 'content': this.selectedBlog.content}
            console.log(requestJson)
            axios
            .put(this.baseURL + "/user/" + this.loggedIn + "/blogs/" + this.displayedBlog.blogId, requestJson)
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";         // this need to be changed.........
                console.log(e);
            });
            this.hideEditModal();
        },

        editBlog() {
            this.showEditModal();
            this.selectedBlog.title = this.displayedBlog.title;
            this.selectedBlog.content = this.displayedBlog.content;
        },
        
        deleteBlog(blogId){
            axios
            .delete(this.baseURL + "/user/" + this.loggedIn + "/blogs/" + this.displayedBlog.blogId)
            .catch( e => {
                this.bannerContent.blogNotFound = "Something went wrong.";
                console.log(e);
            });
            this.hideEditModal();
        },

        deleteComment(blogId, commentId){
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
        showEditModal() {
            this.editModal = true;
        },
        showHomeModal() {
            this.homeModal = true;
        },
        showWriteModal() {
            this.writeModal = true;
            this.homeModal = false;
            console.log("logged in: " + this.loggedIn);
        },
        hideBlogModal() {
            this.isolateModal = false;
            this.authorizedBlog = false;
        },
        hideEditModal() {
            this.editModal = false;
            this.isolateModal = false;
            location.reload();
        },
        hideHomeModal() {
            this.homeModal = false;
        },
        hideWriteModal() {
            this.writeModal = false;
            this.homeModal = true;
            location.reload();
        }
    },// --- methods --- //

    /*
    computed: {
        // we're not tracking upvotes but they could go here if we were
    },

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
