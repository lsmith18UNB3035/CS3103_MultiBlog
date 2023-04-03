DROP TABLE IF EXISTS users;
CREATE TABLE users (
    userId      INT         NOT NULL AUTO_INCREMENT,
    username    VARCHAR(50) NOT NULL,
    password    VARCHAR(25) NOT NULL,
    PRIMARY KEY (userId)
);