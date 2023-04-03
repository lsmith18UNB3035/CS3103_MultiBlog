DROP TABLE IF EXISTS blogs;
CREATE TABLE blogs (
    blogId      INT             NOT NULL AUTO_INCREMENT,
    title       VARCHAR(50)     NOT NULL,
    content     VARCHAR(5000)   NOT NULL,   --3000 is a typical page.. 
    -- should we consider adding another property for overflow content? 
    dateCreated DATE,   --DATETIME?     -- Was there a reason this should be String?
    -- are we going to have to write our own code for interpreting / formatting it?
    userId      INT             NOT NULL,
    PRIMARY KEY (blogId),
    FOREIGN KEY (userId) REFERENCES users(userId)
);