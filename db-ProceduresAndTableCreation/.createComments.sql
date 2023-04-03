DROP TABLE IF EXISTS comments;
CREATE TABLE users (
    commentId   INT             NOT NULL AUTO_INCREMENT,
    content     VARCHAR(500)    NOT NULL,
    dateCreated DATE            NOT NULL,
    -- was author necessary?
    blogId      INT,
    PRIMARY KEY (commentId),
    FOREIGN KEY (blogId) REFERENCES blogs(blogId)
);