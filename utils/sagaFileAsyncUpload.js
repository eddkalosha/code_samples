export const EMITTER_STATUS = {
  success: 'success',
  error: 'error',
  progress: 'progress',
};

function uploadPlanEmitter(action) {
  const {
    carrier, file, year, marketType, selectedState,
  } = action.payload;
  const url = `${URL}`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('planYear', year);
  formData.append('market', marketType);
  formData.append('state', selectedState);  
  let emit;
  const chan = eventChannel((emitter) => {
    emit = emitter;
    return () => {};
  });

  const promise = streamRequest({
    options: { url, method: 'POST' },
    formData,
    onProgress: (res) => {
      const [current, total] = res.replace(/\n/g, '').substring(21).split(' of ');
        if (isNumber(current) && isNumber(total)) {
        emit({ status: types.EMITTER_STATUS.progress, payload: { current, total, message: res.replace('data:', '') } });
      }
    },
  });

  return [promise, chan];
}

function* progressListener(chan) {
  while (true) {
    const { status, payload } = yield take(chan);
    switch (status) {
      case types.EMITTER_STATUS.progress: yield put({ type: types.UPLOAD_PROGRESS, payload }); break;
      default: break;
    }
  }
}

function* uploadPlan(action) {
  try {
    const [promise, chan] = uploadPlanEmitter(action.payload);
    yield fork(progressListener, chan);
    const res = yield call(() => promise);
    const msg = getResponseMessage(res);
    if (msg) {
      toast.success(msg);
    }
    yield put({ type: types.UPLOAD_SUCCESS, payload: res });
  } catch (err) {
    yield put({ type: types.UPLOAD_ERROR, payload: err });
  }
