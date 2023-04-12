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
        commentData: null,
        userBlogData: null,
        editModal: false,
        isolateModal: false,
        homeModal:false,
        wasHomeModal:false,
        writeModal: false,
        authorizedBlog: false,
        addingComment: false,
        editingComment: null,
        currentAuthor: null,

        input: {
            username: "",
            password: ""      
        },

        newBlog:{
            title: "",
            content: ""
        },

        newComment: {
            content: ""
        },

        selectedBlog: {
            title: "",
            content: ""
        }, 

        selectedComment: {
            content: "",
        },

        displayedBlog: {
            blogId: -1,
            userId: -1,
            author: "",
            title: "",
            content: "",
            dateCreated: ""
        },

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
                            this.bannerContent.badLogin = "";
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
                this.bannerContent.blogNotFound = " No blogs exist / undefined error ";
                console.log(e);
            });
        },

        getComments() {
            axios
            .get(this.baseURL + "/blogs/" + this.displayedBlog.blogId + "/comments")
            .then( response => {
                this.commentData = response.data.comments;
            })
            .catch( e => {
                this.bannerContent.blogNotFound = "Comment does not exist";
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
                this.bannerContent.blogNotFound = "Specified user has no blogs";
                console.log(e);
            });
            for(item in this.userBlogData){
                console.log(this.userBlogData[item].author);
                this.currentAuthor = this.userBlogData[item].author;
                break;
            }
            this.showHomeModal();
        },

        displayBlog(blogId){
            this.showBlogModal();
            if(this.homeModal){
                this.wasHomeModal = true;
                this.hideHomeModal();
            }
            for (item in this.blogData) {
                if (this.blogData[item].blogId == blogId) {
                    this.displayedBlog = this.blogData[item]
                    if(this.blogData[item].userId == this.loggedIn){
                        this.authorizedBlog = true;
                    }
                }
            }
            this.getComments();
        },

        addBlog(){
            let requestJson = null;
            requestJson = {'title': this.newBlog.title, 'content': this.newBlog.content}
            axios
            .post(this.baseURL + "/user/" + this.loggedIn + "/blogs", requestJson)
            .catch( e => {
                this.bannerContent.blogNotFound = "Please refrain from using unrecognized characters";
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
                this.bannerContent.blogNotFound = "Could not edit blog, please try again";
                console.log(e);
            });
            this.hideEditModal();
        },

        editBlog() {
            this.showEditModal();
            this.selectedBlog.title = this.displayedBlog.title;
            this.selectedBlog.content = this.displayedBlog.content;
        },
        
        deleteBlog(){
            axios
            .delete(this.baseURL + "/user/" + this.loggedIn + "/blogs/" + this.displayedBlog.blogId)
            .catch( e => {
                this.bannerContent.blogNotFound = "Blog was not deleted. Please try again.";
                console.log(e);
            });
            this.hideEditModal();
        },

        deleteComment(commentId){
            axios
            .delete(this.baseURL + "/user/" + this.loggedIn + "/blogs/" + this.displayedBlog.blogId + "/comments/" + commentId)
            .catch( e => {
                this.bannerContent.blogNotFound = "Comment was not deleted. Please try again.";
                console.log(e);
            });
            this.getComments()
        },

        addComment() {
            let requestJson = null;
            requestJson = {'content': this.newComment.content}
            axios
            .post(this.baseURL + "/user/" + this.loggedIn + "/blogs/" + this.displayedBlog.blogId + "/comments", requestJson)
            .catch( e => {
                this.bannerContent.blogNotFound = "Comment could not be added. Please check fields.";
                console.log(e);
            });
            this.hideCommentModal();
        },

        editComment(commentId) {
            let requestJson = null;
            requestJson = {'content': this.selectedComment.content}
            console.log(requestJson)
            axios
            .put(this.baseURL + "/user/" + this.loggedIn + "/blogs/" + this.displayedBlog.blogId + "/comments/" + commentId, requestJson)
            .catch( e => {
                this.bannerContent.blogNotFound = "Could not edit comment, please try again";
                console.log(e);
            });
            this.updateCommentEdit();
        },

        updateCommentEdit(){
            this.editingComment = null;
            location.reload();
        },

        displayCommentEdit(commentId, content){
            this.editingComment = commentId;
            this.selectedComment.content = content;
        },

        showCommentModal() {
            this.comment = "";
            this.addingComment = true;
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
        },
        hideCommentModal() {
            this.addingComment = false;
            this.getComments();
        },
        hideBlogModal() {
            this.isolateModal = false;
            this.authorizedBlog = false;
            if(this.wasHomeModal){
                this.wasHomeModal = false;
                this.showHomeModal();
            }
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
    },

});


