DROP PROCEDURE IF EXISTS addComment;
DELIMITER //
CREATE PROCEDURE addComment
(
    contentIn   longtext,
    userIdIn int,
    blogIdIn int
)
BEGIN
    INSERT INTO comments (content, dateCreated, userId, blogId) 
    VALUES(contentIn, NOW(), userIdIn, blogIdIn);
    SELECT * from comments where commentId=LAST_INSERT_ID();
END //
DELIMITER ;
