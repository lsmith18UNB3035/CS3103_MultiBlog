DROP PROCEDURE IF EXISTS removeComment;
DELIMITER //
CREATE PROCEDURE removeComment
(
    idIn    INT
)
BEGIN
    DELETE FROM comments WHERE commentId=idIn;
END //
DELIMITER ;
