/**
 * 此文件提供数据库操作语句，对其进行了简单封装
 */
var operation = {
    //user_table结构为：ID NAME PASSWORD 
    user_table: {
        //未使用
        //add:'INSERT INTO user_table(NAME, PASSWORD) VALUES(?,?)',
        //delete: 'DELETE FROM user_table WHERE NAME=?',
        //使用中
        updatePswd:'UPDATE user_table SET PASSWORD=? WHERE NAME=?',
        queryByName: 'SELECT * FROM user_table WHERE NAME=?',
        //queryType: 'SELECT * FROM user_table WHERE TYPE=?',
    },
    //book_table结构为：ID BOOK_NAME WRITER PUBLISHER TYPE ISBN IMG
    book_table: {
        //未使用
        //add:'INSERT INTO book_table(TYPE, TITLE, IMG,TIME) VALUES(?,?,?,?)',
        //update:'UPDATE book_table SET TYPE=?, TITLE=?, IMG=?, TIME=? WHERE ID=?',
        //delete: 'DELETE FROM book_table WHERE ID=?',
        //使用中
        queryByBookname: 'SELECT * FROM book_table WHERE BOOK_NAME LIKE ?',
        queryByISBN: 'SELECT * FROM book_table WHERE ISBN=?'
    },
    match_table: {
        //未使用
        //add:'INSERT INTO news_table(TYPE, TITLE, IMG,TIME) VALUES(?,?,?,?)',
        //update:'UPDATE news_table SET TYPE=?, TITLE=?, IMG=?, TIME=? WHERE ID=?',
        //delete: 'DELETE FROM news_table WHERE ID=?',
        //使用中
        queryByUsername: 'SELECT * FROM match_table WHERE USER_NAME=?',
        queryAll: 'SELECT * FROM match_table'
    }

};

module.exports = operation;