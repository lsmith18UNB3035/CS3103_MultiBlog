DROP PROCEDURE IF EXISTS editComment;
DELIMITER //
CREATE PROCEDURE editComment
(
    idIn        INT,
    contentIn   longtext
)
BEGIN
    UPDATE comments 
    SET content=contentIn
    WHERE commentId=idIn;
END //
DELIMITER ;
