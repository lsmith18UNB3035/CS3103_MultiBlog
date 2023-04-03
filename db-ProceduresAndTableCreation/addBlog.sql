DROP PROCEDURE IF EXISTS addBlog;
DELIMITER //
CREATE PROCEDURE addBlog
(
    titleIn     VARCHAR(50),
    contentIn   longtext,
    userIdIn    int
)
BEGIN
    INSERT INTO blogs (title, content, dateCreated, userId) 
    VALUES(titleIn, contentIn, NOW(), userIdIn);
    SELECT * from blogs where blogId=LAST_INSERT_ID();
END //
DELIMITER ;
