(function(){var log = AppLogger.getLogger(AppLogger.loggerName.STATUS_DAO_LOGGER);

function StatusDAO() {
}
StatusDAO.prototype.constructor = StatusDAO;

StatusDAO.prototype = {
    /**
     * This function takes in statusMessage and insert it into c_status
     *
     * @param statusMessage
     * @param agent
     * @returns {AppClass.GenericResponse}
     */
    insertStatus: function (statusMessage, agent) {
        log.info('statusDAO.insertStatus', {statusMessage: statusMessage, agent: agent});
        var result = AppCollection.Status.insertStatus(statusMessage, agent.userId);
        log.debug("statusDAO.insertStatus", {result: result, agent: agent});
        var response = new AppClass.GenericResponse();
        response.format(result);
        return response;
    },

    /**
     * This function takes in metaData object and update the information
     * into c_user_status_meta and c_status_meta collections
     *
     * @param statusMeta
     * @param agent
     * @returns {AppClass.GenericResponse}
     */
    updateMeta: function (statusMeta, agent) {
        log.info('statusDAO.updateMeta', {statusMeta: statusMeta, agent: agent});
        var result = AppCollection.StatusMeta.updateMeta(statusMeta, agent.userId);
        log.debug("statusDAO.updateMeta", {result: result, agent: agent});
        var response = new AppClass.GenericResponse();
        response.format(result);
        return response;
    },

    insertComment: function (comment, agent) {
        log.info('statusDAO.insertComment', {statusMeta: comment, agent: agent});
        var result = AppCollection.StatusComment.insertComment(comment, agent.userId);
        log.debug("statusDAO.insertComment", {result: result, agent: agent});
        var response = new AppClass.GenericResponse();
        response.format(result);
        return response;
    },

    deleteComment: function (comment, agent) {
        log.info('statusDAO.deleteComment', {comment: comment, agent: agent});
        var result = AppCollection.StatusComment.deleteComment(comment, agent.userId);
        log.debug("statusDAO.deleteComment c_user_status_comment", {result: result, comment: comment, agent: agent});
        var response = new AppClass.GenericResponse();
        response.format(result);
        return response;
    },
    deletePost : function(postId, agent){
        log.info('statusDAO.deletePost', {postId: postId, agent: agent});
        var result = AppCollection.Status.deletePost(postId, agent.userId);
        log.debug("statusDAO.deletePost c_status", {result: result, postId: postId, agent: agent});
        var response = new AppClass.GenericResponse();
        response.format(result);
        return response;

    }
};

_.extend(AppDAO, {
    StatusDAO: new StatusDAO()
});

})();
