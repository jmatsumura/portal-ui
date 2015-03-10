module ngApp.participants.controllers {
  import IParticipant = ngApp.participants.models.IParticipant;
  import IParticipants = ngApp.participants.models.IParticipants;
  import ICoreService = ngApp.core.services.ICoreService;
  import ILocationService = ngApp.components.location.services.ILocationService;
  import IGDCConfig = ngApp.IGDCConfig;

  export interface IParticipantController {
    participant: IParticipant;
    annotationIds: string[];
    DownloadClinicalXML(): void;
  }

  class ParticipantController implements IParticipantController {
    annotationIds: string[];
    /* @ngInject */
    constructor(public participant: IParticipant,
                private CoreService: ICoreService,
                private LocationService: ILocationService,
                private config: IGDCConfig) {
      CoreService.setPageTitle("Participant " + participant.participant_id);

      this.annotationIds = _.map(this.participant.annotations, (annotation) => {
        return annotation.annotation_id;
      });

      this.clinicalFileId = _.find(this.participant.files, (file) => {
        return file.data_subtype.toLowerCase() === "clinical data";
      }).file_id;
    }

  }

  angular
      .module("participants.controller", [
        "participants.services",
        "core.services"
      ])
      .controller("ParticipantController", ParticipantController);
}
