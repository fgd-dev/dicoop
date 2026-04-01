import { SolverOptions } from "../api";
import { sanitizeName } from "../Participant/ParticipantsTools";

export const MAIN_MODEL = (target: number): string => `
%%%%%%%%%%%%%%%%%
%%%% main.lp %%%%
%%%%%%%%%%%%%%%%%

%%%% The following lines do not change the semantics and are only there to avoid unnecessary warning printing. %%%%
never :- never.
joined(0, 0), quitted(0, 0) :- never.
model(enum, M, N, V) :- never, model(enum, M, N, V).
active(C); relax(C); show(C) :- never, declare(module, C).
model(input, C, I, V) :- never, model(input, C, I, V).
specify(parameter, 0, 0, 0) :- never.

#const target = ${target}.
targetYear(Y) :- Y=target.

declare(module, MODULE, MODULE) :- declare(module, MODULE).

badData(MODULE, unknownModuleRelaxed) :- relax(MODULE), not declare(module, MODULE).
badData(MODULE, unknownModuleShown) :- show(MODULE), not declare(module, MODULE).

activeParticipant(P, Y) :- joined(P, Y).
activeParticipant(P, Y) :- activeParticipant(P, Y-1), not quitted(P, Y), targetYear(TY), Y <= TY.
activeParticipant(P) :- activeParticipant(P, Y), targetYear(Y).

declare(enum, core, participant).
declare(enum, core, activeParticipant).
model(enum, core, participant, P) :- joined(P, Y).
model(enum, core, activeParticipant, P) :- activeParticipant(P).

model(attribute, MODULE, P, A, V) :- attribute(MODULE, P, A, V), activeParticipant(P).

%% %%%% Compute default values for unspecified data %%%%
specified(MODULE, P) :- specify(parameter, MODULE, P, L).
model(parameter, MODULE, P, L) :- default(parameter, MODULE, P, L), not specified(MODULE, P).
model(parameter, MODULE, P, L) :- specify(parameter, MODULE, P, L).

model(parameter, MODULE, P,  atMost(UB)) :- model(parameter, MODULE, P, between(LB, UB)).
model(parameter, MODULE, P, atLeast(LB)) :- model(parameter, MODULE, P, between(LB, UB)).
model(parameter, MODULE, P, atLeast(0)) :- model(parameter, MODULE, P, any).

%badData(MODULE, undeclaredAttribute(P, A)) :- attribute(MODULE, P, A, V), not declareAttribute(MODULE, A).
badData(MODULE, undeclared(participant, P, A)) :- model(attribute, MODULE, P, A, V), not activeParticipant(P).

declared(SORT, MODULE, P) :- declare(SORT, MODULE, P, T).
declared(enum, MODULE, ENUM) :- declare(enum, MODULE, ENUM).
badData(MODULE, undeclared(SORT, P, V)) :- model(SORT, MODULE, P, V), not declared(SORT, MODULE, P).

badData(MODULE, distinctValues(parameter, P, L1, L2)) :- specify(parameter, MODULE, P, L1), specify(parameter, MODULE, P, L2), L1 != L2.

defined(parameter, MODULE, P) :- model(parameter, MODULE, P, V).

processedTypeDeclaration(T, V, @typeDecl(T, V)) :- declare(type, T, V).
error(type, T, V, R) :- processedTypeDeclaration(T, V, R), R != true.
needsMore :- processedTypeDeclaration(T, V, never).

wellTyped(enum, MODULE, ENUM, VARIANT) :- model(enum, MODULE, ENUM, VARIANT).
wellTyped(attribute, MODULE, ATTR, VALUE) :- model(attribute, MODULE, P, ATTR, VALUE), declare(attribute, MODULE, ATTR, TYPE), @typeCheck(VALUE, TYPE)=true, not needsMore.
wellTyped(SORT, MODULE, PARAM, VALUE) :- model(SORT, MODULE, PARAM, VALUE), declare(SORT, MODULE, PARAM, TYPE), @typeCheck(VALUE, TYPE)=true, not needsMore.

badData(MODULE, undefined(parameter, P, T)) :- declare(parameter, MODULE, P, T), not defined(parameter, MODULE, P), active(MODULE).
badData(MODULE, typeError(SORT, PARAM, VALUE)) :- model(SORT, MODULE, PARAM, VALUE), not wellTyped(SORT, MODULE, PARAM, VALUE), active(MODULE).
badData(MODULE, typeError(attribute, P, ATTR, VALUE)) :- model(attribute, MODULE, P, ATTR, VALUE), not wellTyped(attribute, MODULE, ATTR, VALUE), active(MODULE).

%%% unknown module%%%

declare(type, bool, true).
declare(type, bool, false).
declare(type, range, between(int, int)).
declare(type, range, any).
declare(type, range, atLeast(int)).
declare(type, range, atMost(int)).

declare(type, TYPENAME, VARIANT) :- model(enum, MODULE, TYPENAME, VARIANT).

#script (lua)
 clingo = require("clingo")
 ctrue = clingo.Function("true", {})
 cfalse = clingo.Function("false", {})
 types = {}

 function typeDecl(tname, value) -- print("typeDecl", tname.name, value.name)
   if next(tname.arguments) ~= nil then return cfalse end
   local typename = tname.name
   local tab = {}
   if not types[typename] then types[typename] = {} end
   if not types[typename][value.name] then types[typename][value.name] = {} end
   for i, arg in ipairs(value.arguments) do
     if next(arg.arguments) ~= nil then return cfalse end
     table.insert(tab, i, arg.name) -- print(value.name, i, arg.name)
   end
   table.insert(types[typename][value.name], tab)
   return ctrue
 end

 function typeCheckAux(v, t) -- print("typeCheckAux", tostring(v), t)
   if t == "int" then return v.number ~= nil
   elseif not types[tostring(t)] then return false
   elseif not types[t][v.name] then return false
   elseif #v.arguments ~= #types[t][v.name][1] then return false end
   for _, choice in pairs(types[t][v.name]) do
 --    print("typeCheckAux", tostring(v), t, i, tostring(choice), "step")
     local choiceOk = true
     for i, variant in ipairs(choice) do
 --      print("typeCheckAux", tostring(v), t, variant, "step step")
       if not typeCheckAux(v.arguments[i], variant) then choiceOk = false end
     end
     if choiceOk then return true end
   end
 --  print("typeCheckAux", tostring(v), t, true)
   return false
 end

 function typeCheck(v, t) -- print("typeCheck", tostring(v), tostring(t))
   if typeCheckAux(v, t.name) then return ctrue else return cfalse end
 end

 function printTypeTable()
   print("print table")
   for tname, values in pairs(types) do for variant, choice in pairs(values) do
     print(tname, variant, "/", #choice[1])
     for _, x in pairs(choice) do for i, y in pairs(x) do print(tname, variant, i, y) end end
   end end
   return ctrue
 end
#end.

#const mode=normal.
option("mode", mode).
goodOption("mode", module). goodOption("mode", type). goodOption("mode", declaration). goodOption("mode", normal).

#const descriptions=all.
option("descriptions", descriptions).
goodOption("descriptions", all). goodOption("descriptions", missing). goodOption("descriptions", none).

relevant(module) :- option("mode", module).
relevant(enum) :- option("mode", type).
relevant(parameter) :- option("mode", declaration).
relevant(attribute) :- option("mode", declaration).

relax(MODULE) :- declare(module, MODULE), not active(MODULE).

:- buggy(MODULE, _), not relax(MODULE), option("mode", normal), not hasBadData. % il est interdit d'avoir un buggy dans MODULE s'il n'est pas relâché. Cad que la relaxation autorise les buggy.
hasBadData :- badData(MODULE, _), active(MODULE).
%test2(@printTypeTable()) :- processedTypeDeclaration(N, V, R).

bad(option, OPTION, VALUE) :- option(OPTION, VALUE), not goodOption(OPTION, VALUE).

#show.
#show option/2.
#show error(type, T, V, R) : error(type, T, V, R).
#show bad(option, O, V) : bad(option, O, V).
#show declare(module, MODULE) : declare(module, MODULE), relevant(module), not option("descriptions", missing).
#show declare(enum, MODULE, E) : declare(enum, MODULE, E), relevant(enum), not option("descriptions", missing).
#show declare(SORT, MODULE, P, T) : declare(SORT, MODULE, P, T), relevant(SORT), not option("descriptions", missing).

#show parameter(MODULE, P, V) : model(parameter, MODULE, P, V), option("mode", normal), not hasBadData.
#show A : display(MODULE, A), show(MODULE), option("mode", normal), not hasBadData.
#show buggy(MODULE, MESSAGE) : buggy(MODULE, MESSAGE), active(MODULE), option("mode", normal), not hasBadData.
#show badData(MODULE, MESSAGE) : badData(MODULE, MESSAGE), active(MODULE), option("mode", normal).

%%
% 1 %activatetick(MODULE, TITLE, DESCR, DBOOL). -> ticked(MODULE, BOOL).
% 2 %userList(MODULE, ENUM, TITLE, DESCR). -> userListed(MODULE, ENUM, VARIANT).
% 3 %paramRangeSlider(MODULE, PARAM, TITLE, DESCR, RMIN, DMIN, DMAX, RMAX). -> rangeSlidered(MODULE, PARAM, MAX, MIN)
% 3 %paramSimpleSlider(MODULE, PARAM, TITLE, DESCR, RMIN, D, RMAX). -> slidered(MODULE, PARAM, VALUE)
% 3 %paramtick(MODULE, PARAM, TITLE, DESCR, DBOOL) -> ticked(MODULE, PARAM, BOOL).
% 3 -> participant(NAME)
% 3 %attr(MODULE, ATTR, TITLE, DESCR)
`;

export const CORE_MODEL = `
%%%%%%%%%%%%%%%%%
%%%% core.lp %%%%
%%%%%%%%%%%%%%%%%

declare(module, core).
declare(attribute, core, party, role).
declare(attribute, core, needsEvaluation, bool).
declare(attribute, core, veto, participant).
declare(parameter, core, reviewsPerformed(T), range) :- participantType(T).
declare(parameter, core, reviewsReceivedFrom(T), range) :- participantType(T). %%%% determines how many certifiers are needed per participant. %%%%
display(core, certify(R, PX)) :- certify(R, PX).

default(parameter, core, reviewsPerformed(T), between(0, 3)) :- participantType(T).

declare(enum, core, role).
model(enum, core, role, T) :- participantType(T).
participantType(first; second).

%%%% First party participants may be reviewed by others. %%%%
%%%% This can be made faster by directly incorporating the upper bound on the number of reviews needed. %%%%
{ certify(R, F) : activeParticipant(R) } :- model(attribute, core, F, needsEvaluation, true).

%%%% Each farm gets sufficiently many first party, second party, and total certifiers. %%%%
buggy(core, received(F, T)) :- model(parameter, core, reviewsReceivedFrom(T), atLeast(LB)), model(attribute, core, F, needsEvaluation, true), not LB #count { R : model(attribute, core, R, party, T), certify(R, F) }.
buggy(core, received(F, T)) :- model(parameter, core, reviewsReceivedFrom(T),  atMost(UB)), model(attribute, core, F, needsEvaluation, true), not #count { R : model(attribute, core, R, party, T), certify(R, F) } UB.

%%%% Each participant PX performs <= K certificates. %%%%
buggy(core, performed(R, T)) :- model(parameter, core, reviewsPerformed(T), atLeast(LB)), model(attribute, core, R, party, T), not LB #count { Y : certify(R, Y) }.
buggy(core, performed(R, T)) :- model(parameter, core, reviewsPerformed(T),  atMost(UB)), model(attribute, core, R, party, T), not #count { Y : certify(R, Y) } UB.

badData(core, participantBothFirstSecondParty(P)) :- model(attribute, core, P, party, first), model(attribute, core, P, party, secon).
badData(core, participantNoParty(P)) :- activeParticipant(P), not model(attribute, core, P, party, first), not model(attribute, core, P, party, second).

certify(P1, P2, Y) :- certify(P1, P2, Y), never.

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%% TO BE GENERALIZED and turned into a preference. %%%%
buggy(core, gainKnowledge) :- certify(PX, PY), certify(PX, PZ), certify(PY, PZ), PY!=PX.


%%%% Can only select participants PX able/willing to certify PY. %%%%
buggy(core, unsatisfiedVeto(PX, PY)) :- certify(PX, PY), model(attribute, core, PX, veto, PY).

`;

export const RECIPROCITY_MODEL = `
%%%%%%%%%%%%%%%%%%%%%%%%
%%%% reciprocity.lp %%%%
%%%%%%%%%%%%%%%%%%%%%%%%

%%%% Compute reachability in k steps %%%%
declare(module, reciprocity).
declare(parameter, reciprocity, minLength, int).
default(parameter, reciprocity, minLength, 2).

reachable(PX, PY, 1) :- certify(PX, PY).
reachable(PX, PZ, K+1) :- reachable(PX, PY, K), certify(PY, PZ), K < L, model(parameter, reciprocity, minLength, L).
buggy(reciprocity, shortcycle(PX, K)) :- reachable(PX, PX, K).

`;

export const FOLLOW_UP_MODEL = (to: number) => `
%%%%%%%%%%%%%%%%%%%%%%
%%%% follow-up.lp %%%%
%%%%%%%%%%%%%%%%%%%%%%

declare(module, followUp).
declare(attribute, followUp, certified(YEAR), participant) :- year(YEAR).
year(0..${to}).
declare(parameter, followUp, maxConsecutive, int).
declare(parameter, followUp, provided, range).
declare(parameter, followUp, required, range).
display(followUp, followingUp(X, F)) :- followingUp(X, F).

requireFollowUp(F) :- model(attribute, core, F, needsEvaluation, true), targetYear(Y), model(parameter, followUp, required, atLeast(LB)), LB #count { R : activeParticipant(R), model(attribute, followUp, R, certified(Y-1), F) }.

followingUp(X, F) :- targetYear(Y), certify(X, F), model(attribute, followUp, X, certified(Y-1), F).
followingUpSince(X, F, Y) :- targetYear(Y), certify(X, F).
followingUpSince(X, F, Y-1) :- followingUpSince(X, F, Y), model(attribute, followUp, X, certified(Y-1), F).
followingUpDuration(X, F, Y-Z) :- targetYear(Y), followingUpSince(X, F, Z), not model(attribute, followUp, X, certified(Z-1), F).
maxFollowingUpDuration(T, M) :- participantType(T), M = #max { G : followingUpDuration(X, F, G), model(attribute, core, X, party, T) }.

receivesFollowUp(F, C) :- requireFollowUp(F), C = #count { R : followingUp(R, F) }.
buggy(followUp, receivesFollowUp(F, C)) :- receivesFollowUp(F, C), model(parameter, followUp, required, atLeast(LB)), C < LB.
buggy(followUp, receivesFollowUp(F, C)) :- receivesFollowUp(F, C), model(parameter, followUp, required,  atMost(UB)), UB < C.

providesFollowUp(X, C) :- activeParticipant(X), C = #count { F : followingUp(X, F) }.
buggy(followUp, providesFollowUp(X, C)) :- providesFollowUp(X, C), model(parameter, followUp, provided, atLeast(LB)), C < LB.
buggy(followUp, providesFollowUp(X, C)) :- providesFollowUp(X, C), model(parameter, followUp, provided,  atMost(UB)), UB < C.

buggy(followUp, consecutiveFollowUps) :- maxFollowingUpDuration(T, M), model(parameter, followUp, maxConsecutive, UB), UB < M.

`;

export const SKILLS_MODEL = `
%%%%%%%%%%%%%%%%%%%
%%%% skills.lp %%%%
%%%%%%%%%%%%%%%%%%%

declare(module, skills).
declare(enum, skills, global).
declare(enum, skills, individual).
declare(attribute, skills, provides, global).
declare(attribute, skills, provides, individual).
declare(attribute, skills, requires, individual).
declare(parameter, skills, individualRequires(E), range) :- model(enum, skills, individual, E).

requires(F, S, Quantity) :-
   model(parameter, skills, individualRequires(S), Quantity),
   model(attribute, skills, F, requires, S),
   model(attribute, core, F, needsEvaluation, true).

buggy(skills, wrongNumber(X, S)) :- requires(X, S, atLeast(LB)),
   not LB #count { Y : model(attribute, skills, Y, provides, S), certify(Y, X) }.

buggy(skills, wrongNumber(X, S)) :- requires(X, S, atMost(UB)),
   not #count { Y : model(attribute, skills, Y, provides, S), certify(Y, X) } UB.

display(skills, requires(F, S, Quantity)) :- requires(F, S, Quantity).

`;

export const COMMITTEE_MEETING_MODEL = `
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%% committee-meeting.lp %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

declare(module, committeeMeeting).
declare(enum, committeeMeeting, existingDate). % conceivable dates, user data.
declare(input, committeeMeeting, impossibleDate, existingDate). % undesired dates for the meeting, admin choice.
declare(attribute, committeeMeeting, availableOn, existingDate).
declare(parameter, committeeMeeting, subjectPresent, bool).
declare(parameter, committeeMeeting, attendance(T), range) :- participantType(T). % how often can we ask a reviewer to attend a meeting?
declare(parameter, committeeMeeting, reviewersPresent(T), range) :- participantType(T). % when F is examined, how many of its reviewers should be present?
declare(parameter, committeeMeeting, reviewersPresent(anyType), range).
declare(parameter, committeeMeeting, size, range).

display(committeeMeeting, schedule(P, D)) :- schedule(P, D).
display(committeeMeeting, attend(P, D)) :- attend(P, D).

%%%% Committee Meeting scheduling. %%%%
default(committeeMeeting, attendance(T), any) :- participantType(T).

badData(committeeMeeting, unknownDate(D)) :- model(attribute, committeeMeeting, P, availableOn, D), not model(enum, committeeMeeting, existingDate, D).
badData(committeeMeeting, noPossibleDate) :- #count { D : possibleDate(D) } 0.
possibleDate(D) :- model(enum, committeeMeeting, existingDate, D), not model(input, committeeMeeting, impossibleDate, D).
chosenDate(D) :- schedule(P, D).

1 { schedule(F, D) : possibleDate(D) } 1 :- model(attribute, core, F, needsEvaluation, true).
buggy(committeeMeeting, unavailable(F, D)) :- model(parameter, committeeMeeting, subjectPresent, true), schedule(F, D), not model(attribute, committeeMeeting, F, availableOn, D).
{ attend(P, D) : model(attribute, committeeMeeting, P, availableOn, D) } :- activeParticipant(P).
attend(F, D) :- model(parameter, committeeMeeting, subjectPresent, true), schedule(F, D).
buggy(committeeMeeting, wrongNumberofAttendance(P)) :- model(attribute, core, P, party, T), model(parameter, committeeMeeting, attendance(T), atLeast(LB)), not LB { attend(P, D) : model(attribute, committeeMeeting, P, availableOn, D) }.
buggy(committeeMeeting, wrongNumberofAttendance(P)) :- model(attribute, core, P, party, T), model(parameter, committeeMeeting, attendance(T),  atMost(UB)), not { attend(P, D) : model(attribute, committeeMeeting, P, availableOn, D) } UB.

attendingReviewers(T, F, C) :- participantType(T), schedule(F, D), C = #count { X : certify(X, F), attend(X, D), model(attribute, core, X, party, T) }.
totalAttendingReviewers(F, C) :- schedule(F, D), C = #count { X : certify(X, F), attend(X, D), model(attribute, core, X, party, T), participantType(T) }.
buggy(committeeMeeting, wrongNumberOfReviewers(T, F, C)) :- model(parameter, committeeMeeting, reviewersPresent(T), atLeast(LB)),   attendingReviewers(T, F, C), C < LB.
buggy(committeeMeeting, wrongNumberOfReviewers(T, F, C)) :- model(parameter, committeeMeeting, reviewersPresent(T),  atMost(UB)),   attendingReviewers(T, F, C), UB < C.
buggy(committeeMeeting, wrongNumberOfReviewers(anyType, F, C)) :- model(parameter, committeeMeeting, reviewersPresent(anyType), atLeast(LB)), totalAttendingReviewers(F, C), C < LB.
buggy(committeeMeeting, wrongNumberOfReviewers(anyType, F, C)) :- model(parameter, committeeMeeting, reviewersPresent(anyType),  atMost(UB)), totalAttendingReviewers(F, C), UB < C.
buggy(committeeMeeting, wrongSize) :- model(parameter, committeeMeeting, size, atLeast(LB)), chosenDate(D), not LB #count { P : schedule(P, D) }.
buggy(committeeMeeting, wrongSize) :- model(parameter, committeeMeeting, size,  atMost(UB)), chosenDate(D), not #count { P : schedule(P, D) } UB.

`;

export const LOCATION_MODEL = `
%%%%%%%%%%%%%%%%%%%%%
%%%% location.lp %%%%
%%%%%%%%%%%%%%%%%%%%%

declare(module, location).
declare(enum, location, region). % locations that the users can be in.
declare(attribute, location, basedIn, region).
declare(parameter, location, acceptableCost(T), range) :- participantType(T).
declare(parameter, location, distance(E, E'), int) :- participantType(T), model(enum, location, region, E), model(enum, location, region, E').
display(location, travelingCost(X, C)) :- travelingCost(X, T, C).

%badData(location, inconsistentDistance(R, S, D1, D2)) :- model(parameter, location, distance(R, S), D1), model(parameter, location, distance(S, R), D2), D1 != D2.
%badData(location, badLocation(X, R)) :- model(attribute, location, X, basedIn, R), not model(enum, location, region, R).
distance(X, Y, D) :- model(attribute, location, X, basedIn, R), model(attribute, location, Y, basedIn, S), model(parameter, location, distance(R, S), D).

travelingCost(X, T, C) :- model(attribute, core, X, party, T), C = #sum { D : distance(X, Y, D), certify(X, Y) }.

buggy(location, cost(X, C)) :- model(parameter, location, acceptableCost(T), atLeast(LB)), travelingCost(X, T, C), C < LB.
buggy(location, cost(X, C)) :- model(parameter, location, acceptableCost(T),  atMost(UB)), travelingCost(X, T, C), UB < C.

`;

export const SPECIFIC_ACTIVE_MODEL = `
%%%%%%%%%%%%%%%%%%%%%%%%%
%%%% SPECIFIC/active.lp %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%

active(committeeMeeting).
active(core).
active(followUp).
active(location).
active(reciprocity).
active(skills).

`;

export const SPECIFIC_CONFIG_MODEL = (options: SolverOptions): string => {
  // Pro settings
  const nbProParticipantsValue = options.settings?.nbProParticipants?.value;
  const minNbProParticipants = nbProParticipantsValue
    ? nbProParticipantsValue[0]
    : 0;
  const maxNbProParticipants = nbProParticipantsValue
    ? nbProParticipantsValue[1]
    : 5;
  const NbOfAssignmentsForAProfessional =
    options.settings?.numberOfAssignmentsForAProfessional?.value;
  const minNbOfAssignmentsForAProfessional = NbOfAssignmentsForAProfessional
    ? NbOfAssignmentsForAProfessional[0]
    : 0;
  const maxNbOfAssignmentsForAProfessional = NbOfAssignmentsForAProfessional
    ? NbOfAssignmentsForAProfessional[1]
    : 5;

  // NonPro settings
  const nbNonProParticipantsValue =
    options.settings?.nbNonProParticipants?.value;
  const minNbNonProParticipants = nbNonProParticipantsValue
    ? nbNonProParticipantsValue[0]
    : 0;
  const maxNbNonProParticipants = nbNonProParticipantsValue
    ? nbNonProParticipantsValue[1]
    : 5;
  const NbOfAssignmentsForANonProfessional =
    options.settings?.numberOfAssignmentsForANonProfessional?.value;
  const minNbOfAssignmentsForANonProfessional =
    NbOfAssignmentsForANonProfessional
      ? NbOfAssignmentsForANonProfessional[0]
      : 0;
  const maxNbOfAssignmentsForANonProfessional =
    NbOfAssignmentsForANonProfessional
      ? NbOfAssignmentsForANonProfessional[1]
      : 5;

  // Relax location
  const noRelaxLocation = options.settings?.useAvailability ? "%" : "";

  // Location matrix
  let locationRules = ``;
  if (
    options.settings?.distanceMatrix?.distances &&
    options.settings?.distanceMatrix?.locations
  ) {
    const distances = options.settings?.distanceMatrix?.distances;
    const locations = options.settings?.distanceMatrix?.locations;
    let lineNb = 0;
    for (const line of distances) {
      let colNb = 0;
      for (const col of line) {
        locationRules += `specify(parameter, location, distance(${sanitizeName(
          locations[lineNb]
        )}, ${sanitizeName(locations[colNb])}), ${col}).`;
        colNb++;
      }
      lineNb++;
    }
  }

  // Nb reviewers to be present
  const nbReviewersPresent = 2;

  // Follow Up and Rotation settings
  const nbRequiredFollowUps = options.settings?.nbInspectorsFollowingUp ?? 0;
  const maxConsecutiveFollowUps = options.settings?.nbRotationsToReinspect;

  // Travelling cost
  const travellingDistanceRangeValue =
    options.settings?.travellingDistanceRange?.value;
  const minTravellingCost = travellingDistanceRangeValue
    ? travellingDistanceRangeValue[0]
    : 0;
  const maxTravellingCost = travellingDistanceRangeValue
    ? travellingDistanceRangeValue[1]
    : 10000;

  // Committee meeting size
  const committeeMeetingSizeRangeValue =
    options.settings?.committeeMeetingSize?.value;
  const minCommitteeMeetingSize = committeeMeetingSizeRangeValue
    ? committeeMeetingSizeRangeValue[0]
    : 0;
  const maxCommitteeMeetingSize = committeeMeetingSizeRangeValue
    ? committeeMeetingSizeRangeValue[1]
    : 10000;
  return `
%%%%%%%%%%%%%%%%%%%%%%%%%
%%%% SPECIFIC/config.lp %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%

specify(parameter, core, reviewsReceivedFrom(first), between(${minNbProParticipants}, ${maxNbProParticipants})).
specify(parameter, core, reviewsPerformed(first), between(${minNbOfAssignmentsForAProfessional}, ${maxNbOfAssignmentsForAProfessional})).

specify(parameter, core, reviewsReceivedFrom(second), between(${minNbNonProParticipants}, ${maxNbNonProParticipants})).
specify(parameter, core, reviewsPerformed(second), between(${minNbOfAssignmentsForANonProfessional}, ${maxNbOfAssignmentsForANonProfessional})).

specify(parameter, reciprocity, minLength, 2).

specify(parameter, committeeMeeting, subjectPresent, true).
specify(parameter, committeeMeeting, reviewersPresent(first), any).
specify(parameter, committeeMeeting, reviewersPresent(second), any).
specify(parameter, committeeMeeting, reviewersPresent(anyType), atLeast(${nbReviewersPresent})).
specify(parameter, committeeMeeting, attendance(first), between(1, 2)).
specify(parameter, committeeMeeting, attendance(second), atMost(1)).
specify(parameter, committeeMeeting, size, between(${minCommitteeMeetingSize}, ${maxCommitteeMeetingSize})).

%model(input, committeeMeeting, impossibleDate, wed).
%model(input, committeeMeeting, impossibleDate, mon).
%model(input, committeeMeeting, impossibleDate, tue).
%model(input, committeeMeeting, impossibleDate, thu).
%model(input, committeeMeeting, impossibleDate, fri).
%model(input, committeeMeeting, impossibleDate, april).

specify(parameter, followUp, required, between(${nbRequiredFollowUps}, ${nbRequiredFollowUps})). %% exactly one person should already have been a reviewer last year
specify(parameter, followUp, provided, atMost(1)). %% each reviewer performs no more than a single follow up.
specify(parameter, followUp, maxConsecutive, ${maxConsecutiveFollowUps}). %% no reviewer will be following up the same farm two years in a row.

${locationRules}

specify(parameter, location, acceptableCost(first), between(${minTravellingCost}, ${maxTravellingCost})).
specify(parameter, location, acceptableCost(second), between(${minTravellingCost}, ${maxTravellingCost})).

%%%% Comment out to avoid showing this information %%%%
show(core).  % Print terms of the form "certify(PX, PY)" indicating that the computed solution suggest "PX" should certify "PY".
show(committeeMeeting).
show(followUp).
%show(location).
show(skills).

%%% comment out the following lines as needed when the corresponding constraints make the task impossible.
%relax(core).
%relax(committeeMeeting).
%relax(followUp).
%relax(reciprocity).
${noRelaxLocation}relax(location).
%relax(skills).

% Supposons que l'on veuille rajouter des contraintes pr�cises malgr� la relaxation.
% Lorsque les buggy apparaissent dans le run.
% ":- XXX" signifie que XXX est interdit.

%:- buggy(location,cost(najim,0)).
%:- buggy(location,cost(moussa,0)).

`;
};
